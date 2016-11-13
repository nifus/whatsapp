<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Mockery\CountValidator\Exception;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\User;
use App\ChatPost;
use App\Chat;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;
use App\Events\SignOutEvent;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => [ 'authenticate']]);
    }

    public function getContactsById($id){
        try{
            $user = User::find($id);

            $contacts = $user->getContacts();
            return response()->json($contacts  );
        }catch( \Exception $e ){
            return response()->json( null );
        }
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
            $contacts = $user->getContacts();


            return response()->json($contacts  );
        }catch( \Exception $e ){
            return response()->json( null );
        }
    }


    public function getChatsById($id){
        try{
            $user = User::find($id);
            $chats = $user->Chats;//()->where('is_group',1)->pluck('id')->toArray();

            $members =  $user->Contacts->pluck('id')->toArray();
            $members = array_merge($members, $user->BackContacts->pluck('id')->toArray());

            $result = [];
            foreach( $chats as $chat ){
                $chat_members = $chat->Members()->pluck('id')->toArray();
                $access = true;
                foreach( $chat_members as $member ){
                    if ( !in_array($member, $members) &&  $member!=$user->id && $chat->is_group==0){

                        break;
                    }
                }
                if ( $access ){
                    array_push($result,array_merge($chat->toArray(),
                        [
                            'CountUnreadMessages'=>ChatPost::getCountUnreadPosts($chat->id, $user->id),
                            'LastPost' => Chat::getLastPost($chat->id, $user->id),
                            'ChatAvatar' => $chat->getAvatar($user->id)
                        ]
                    ));
                }

            }
            return response()->json($result);
        }catch( \Exception $e ){

            dd($e->getMessage());
            return response()->json( null );
        }
    }
    public function getChats(){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_deleted=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }

            $chats = $user->Chats;//()->where('is_group',1)->pluck('id')->toArray();

            $members =  $user->Contacts->pluck('id')->toArray();
            $members = array_merge($members, $user->BackContacts->pluck('id')->toArray());

            $result = [];
            foreach( $chats as $chat ){
                $chat_members = $chat->Members()->pluck('id')->toArray();
                $access = true;
                foreach( $chat_members as $member ){
                    if ( !in_array($member, $members) &&  $member!=$user->id && $chat->is_group==0){
                        break;
                    }
                }
                if ( $access ){
                    array_push($result,array_merge($chat->toArray(),
                        [
                            'CountUnreadMessages'=>\DB::table('chats_members')->where('user_id', $user->id)->where('chat_id', $chat->id)->first()->unread,
                            'posts' => $chat->getFirstPosts($user->id),
                            'ChatAvatar' => $chat->getAvatar($user->id)
                        ]
                    ));
                }

            }
            return response()->json($result);
        }catch( \Exception $e ){

            dd($e->getMessage());
            return response()->json( null );
        }
    }

    public function setStatus($status){
        $user = JWTAuth::parseToken()->authenticate();
        $user->update(['is_online'=>$status=='on' ? 1 : 0]);
    }

    public function getLastAction($user_id){
        $user = User::find($user_id);
        //был(-а) вчера в 17:43
        if ( is_null($user->last_action) ){
            return response()->json( ['last_active'=>'Нет активности'] );
        }

        $date = new \DateTime($user->last_action);
        return response()->json( ['last_active'=>'был(-а) активен '.$date->format('d.m.Y в h:i')] );

    }


    public function getAuth()
    {
        try{

            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user JWT');
            }
            $user->Group;
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no token');
            }

            if ($user->remember_token!=$_COOKIE['session']){
                throw new \Exception('no cookie');
            }

            return response()->json($user->toArray()  );
        }catch( \Exception $e ){
            return response()->json( ['success'=>false,'error'=>$e->getMessage()] );
        }
    }

    public function getAll(){
        $users = User::getAllUsers();
        return response()->json($users->toArray() );
    }


    public function getById($id){
        $user = User::find($id);
        $result = $user->toArray();

        $contacts = $user->getContacts();
        $names=[];
        foreach( $contacts as $contact ){
            array_push($names, $contact->login);
        }
        $result['users'] = implode(',',$names);
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
            $user = User::find($id);
            return response()->json(['success'=>true,'user'=>$user->toArray()]);
        }catch( \Exception $e ){
            return response()->json(['success'=>false, 'error'=>$e->getMessage()]);
        }
    }
    public function updateProfile(Request $request ){
        try{

            $user = User::getUser();
            if ( is_null($user) ) {
                Abort(404);
            }
            $user->updateUserProfile($request->only(['avatar','name']));
            return response()->json(['success'=>true,'user'=>$user->toArray()]);
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
            if ( $user->password=='' && md5($credentials['password']==$user->old_pass)){
                $user->update(['password'=>\Hash::make($credentials['password'])]);
            }elseif ( !$token = JWTAuth::attempt($credentials)) {
               // event( new SignInErrorEvent($credentials['email'], 'Пользователь не найден' ) );
                return response()->json(['error' => 'Пользователь не найден'], 401);
            }
        } catch (JWTException $e) {
          //  event( new SignInErrorEvent($credentials['email'],$e->getMessage()) );
            return response()->json(['error' => $e->getMessage()], 500);
        }
        //event( new SignInSuccessEvent($credentials['email']) );
        $user->updateLastLogin();

        return response()->json(['token'=>$token,'user'=>$user->toArray()]);
    }

    public function updateToken(){
        $user = JWTAuth::parseToken()->authenticate();

        $token = JWTAuth::fromUser($user);
        return response()->json(compact('token'));

    }


}
