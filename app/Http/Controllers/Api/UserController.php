<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Mockery\CountValidator\Exception;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\User;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;
use App\Events\SignOutEvent;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['getAuthUser', 'authenticate']]);
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
        $users = User::find($id);
        return response()->json($users->toArray() );
    }

    public function store( Request $request ){
        $data = $request->all();
        try{
            User::createNewActivatedUser($data);
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
        $credentials = $request->only('email', 'password');

        try {
            $user = User::getUserByEmail($credentials['email']);
            if ( is_null($user) ){
                throw new JWTException( 'Пользователь не найден' );
            }

            if (! $token = JWTAuth::attempt($credentials)) {

                event( new SignInErrorEvent($credentials['email'], 'Пользователь не найден' ) );

                return response()->json(['error' => trans('app.signIn.invalid_credentials')], 401);
            }
        } catch (JWTException $e) {
            event( new SignInErrorEvent($credentials['email'],$e->getMessage()) );
            return response()->json(['error' => $e->getMessage()], 500);
        }
        event( new SignInSuccessEvent($credentials['email']) );
        return response()->json(compact('token'));
    }

    public function updateToken(){
        $user = JWTAuth::parseToken()->authenticate();

        $token = JWTAuth::fromUser($user);
        return response()->json(compact('token'));

    }


}
