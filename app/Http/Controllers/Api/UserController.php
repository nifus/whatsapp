<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Mockery\CountValidator\Exception;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\User;
use App\ChatPost;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;
use App\Events\SignOutEvent;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['getAuthUser', 'authenticate']]);
    }

    public function getContacts(){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }
            $contacts = $user->Contacts;
            return response()->json($contacts->toArray()  );
        }catch( \Exception $e ){
            return response()->json( null );
        }
    }

    public function getChats(){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }

            $chats = $user->Chats;
            $result = [];
            foreach( $chats as $chat ){
                array_push($result,array_merge($chat->toArray(),['CountUnreadMessages'=>ChatPost::getCountUnreadPosts($chat->id, $user->id)]));
            }



            return response()->json($result);
        }catch( \Exception $e ){

            dd($e->getMessage());
            return response()->json( null );
        }
    }

    public function getStatus(){
        return response()->json( ['online'=>true, 'last_active'=>null] );

    }


    public function getAuth()
    {
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            $user->Group;
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }
            return response()->json($user->toArray()  );
        }catch( \Exception $e ){
            return response()->json( null );
        }
    }

    public function getAll(){
        $users = User::getAllUsers();
        return response()->json($users->toArray() );
    }


    public function getById($id){
        $user = User::find($id);
        $result = $user->toArray();
        $result['users'] = $user->Users;
        return response()->json($result );
    }

    public function store( Request $request ){
        $data = $request->all();
        try{
            $user = User::createNewActivatedUser($data);
            if ( !empty($data['users'])){
                $user->sinxContacts($data['users']);
            }

            return response()->json(['success'=>true]);
        }catch( \Exception $e ){
            return response()->json(['success'=>false, 'error'=>$e->getMessage()]);
        }
    }

    public function update($id, Request $request ){

        try{
            $user = User::find($id);
            if ( is_null($user) ) {
                Abort(404);
            }
            $user->updateUser($request->all());
            return response()->json(['success'=>true]);
        }catch( \Exception $e ){
            return response()->json(['success'=>false, 'error'=>$e->getMessage()]);
        }
    }



    public function delete($id)
    {
       /* $now_user = JWTAuth::parseToken()->authenticate();
        if ( !$user->hasDelete($now_user) ){
            Abort(403);
        }*/

        $user = User::find($id);
        if ( is_null($user) ){
            Abort(404);
        }

        $user->delete();
        return response()->json(['success'=>true]);
    }

    public function restore($id){
        $user = User::find($id);
        if ( is_null($user) ){
            Abort(404);
        }

        $user->restore();
        return response()->json(['success'=>true]);
    }


    public function logout(){
        $user = JWTAuth::parseToken()->authenticate();
        if ( !is_null($user) ){
            event( new SignOutEvent($user->id ) );
        }
        JWTAuth::invalidate(JWTAuth::getToken());
    }
    /**
     * SignIn service
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function authenticate(Request $request)
    {
        $credentials = $request->only('login', 'password');

        try {
            $user = User::getUserByLogin($credentials['login']);
            if ( is_null($user) ){
                throw new JWTException( 'Пользователь не найден' );
            }
            $token = JWTAuth::fromUser($user);

            //if (! $token = JWTAuth::attempt($credentials)) {

            //    event( new SignInErrorEvent($credentials['email'], 'Пользователь не найден' ) );
               // return response()->json(['error' => trans('app.signIn.invalid_credentials')], 401);
            //}
        } catch (JWTException $e) {
          //  event( new SignInErrorEvent($credentials['email'],$e->getMessage()) );
            return response()->json(['error' => $e->getMessage()], 500);
        }
        //event( new SignInSuccessEvent($credentials['email']) );
        $user->updateLastLogin();

        return response()->json(compact('token'));
    }

    public function updateToken(){
        $user = JWTAuth::parseToken()->authenticate();

        $token = JWTAuth::fromUser($user);
        return response()->json(compact('token'));

    }


}
