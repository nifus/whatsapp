<?php
namespace App\Http\Controllers\Api;

use App\Chat;
use App\ChatPost;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;

use App\User;




class ChatController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', []);
    }


    public function getById($chat_id){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }
            $chat = chat::with('Members')->find($chat_id);
            if ( !$chat->canAccess($user->id) ){
                throw new \Exception('no access');
            }
            $data = $chat->toArray();
            $data['CountUnreadMessages'] = ChatPost::getCountUnreadPosts($chat->id, $user->id);
            $data['LastPost'] = Chat::getLastPost($chat->id, $user->id);
            $data['ChatAvatar'] = $chat->getAvatar($user->id);
            return response()->json($data);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }

    public function chatStatus($chat_id){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }
            $chat = Chat::find($chat_id);
            $data = $chat->toArray();
            $data['CountUnreadMessages'] = ChatPost::getCountUnreadPosts($chat->id, $user->id);

            $data['LastPost'] = Chat::getLastPost($chat->id, $user->id);
            $data['success'] = true;
            $data['Posts'] = ChatPost::getPosts($chat->id,0,$data['CountUnreadMessages']);


            return response()->json($data);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }

    public function chatRead($chat_id){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }
            $chat = Chat::find($chat_id);
            $chat->read4user($user->id);

            return response()->json();

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }


    public function search($key){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }
            $chats = $user->Chats()->get();
            $ids = [];
            foreach($chats as $chat){
                array_push($ids, $chat->id);
            }
            $posts = ChatPost::whereIn('chat_id', $ids)->where('message','like','%'.$key.'%')->where('is_deleted','0')->where('is_system',0)->get();



            return response()->json(['success'=>true, 'post'=>$posts->toArray()]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }

    public function addMember($chat, $member){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }
            $chat = Chat::find($chat);
            $chat->addMember($member);
            return response()->json(['success'=>true, 'post'=>null]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }

    public function removeMember($chat, $member){
        try{
        $user = JWTAuth::parseToken()->authenticate();
        if ( is_null($user) ){
            throw new \Exception('no user');
        }
        if ( $user->is_delete=='1' ){
            JWTAuth::invalidate(JWTAuth::getToken());
            throw new \Exception('no user');
        }
        $chat = Chat::find($chat);
            $chat->removeMember($member);
            return response()->json(['success'=>true,'chat'=>$chat->toArray(), 'post'=>null]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }

    public function addGroup(Request $request){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }
            $data = $request->all();

            $chat = Chat::createNewGroup($user->id, $data);
            $chat = Chat::with('Members')->with('LastPost')->find($chat->id);
            $data = array_merge($chat->toArray(),
                ['ChatAvatar' => $chat->getAvatar($user->id)]
            );
            return response()->json(['success'=>true,'chat'=>$data]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }

    public function store(Request $request){

        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }
            $data = $request->all();
            $request_members = $data['members'];
            array_push($request_members, $user->id );
            $chats = $user->Chats()->where('is_group',0)->get();

            foreach( $chats as  $chat ){
                $members = $chat->Members()->pluck('id')->toArray();
                //dd(array_diff($request_members,$members));
                if ( array_diff($request_members,$members)==[] ){
                    return response()->json(['success'=>false,'chat_id'=>$chat->id]);
                }

            }

            $chat = Chat::createNewChat($user->id,$data['members']);
            $chat = Chat::with('Members')->with('LastPost')->find($chat->id);

            $data = array_merge($chat->toArray(),
                ['ChatAvatar' => $chat->getAvatar($user->id)]
            );
            return response()->json(['success'=>true,'chat'=>$data]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }

    }

    public function updateChat($id, Request $request){
        $data = $request->all();

        $user = JWTAuth::parseToken()->authenticate();
        if ( is_null($user) ){
            throw new \Exception('no user');
        }
        if ( $user->is_delete=='1' ){
            JWTAuth::invalidate(JWTAuth::getToken());
            throw new \Exception('no user');
        }

        Chat::find($id)->update($data);
        $chat =  Chat::find($id);
        return response()->json(['success'=>true,'chat'=>$chat->toArray()]);

    }

    public function loadChat($id, Request $request){
        $data = $request->all();
        $data['start'] = $request['start'];
        $data['count'] = $request['count'];;
        $user = JWTAuth::parseToken()->authenticate();
        if ( is_null($user) ){
            throw new \Exception('no user');
        }
        if ( $user->is_delete=='1' ){
            JWTAuth::invalidate(JWTAuth::getToken());
            throw new \Exception('no user');
        }

        $chat = Chat::find($id);
        if ( !$chat->canAccess($user->id) ){
            throw new \Exception('no cht');
        }
        $posts = $chat->getPosts($data['start'],$data['count'], $user->id);
        $chat->readPosts4User($user->id);
        return response()->json(['success'=>true,'posts'=>$posts->toArray()]);
    }

    public function loadChatAroundId($chat_id, $post_id, Request $request){
        $data = $request->all();
       // $data['start'] = $request['start'];
        $data['count'] = $request['count'];;
        $user = JWTAuth::parseToken()->authenticate();
        if ( is_null($user) ){
            throw new \Exception('no user');
        }
        if ( $user->is_delete=='1' ){
            JWTAuth::invalidate(JWTAuth::getToken());
            throw new \Exception('no user');
        }

        $chat = Chat::find($chat_id);
        if ( !$chat->canAccess($user->id) ){
            throw new \Exception('no cht');
        }
        $posts = $chat->getPostsAroundId($post_id,$data['count'], $user->id);
        //$chat->readPosts4User($user->id);
        return response()->json(['success'=>true,'posts'=>$posts]);
    }

    public function loadChatDown($chat_id, $post_id, Request $request){
        $data = $request->all();
       // $data['start'] = $request['start'];
        $data['count'] = $request['count'];;
        $user = JWTAuth::parseToken()->authenticate();
        if ( is_null($user) ){
            throw new \Exception('no user');
        }
        if ( $user->is_delete=='1' ){
            JWTAuth::invalidate(JWTAuth::getToken());
            throw new \Exception('no user');
        }

        $chat = Chat::find($chat_id);
        if ( !$chat->canAccess($user->id) ){
            throw new \Exception('no cht');
        }
        $posts = $chat->getPostsDown($post_id,$data['count'], $user->id);
       // $chat->readPosts4User($user->id);
        return response()->json(['success'=>true,'posts'=>$posts]);
    }


    public function addPost($chat_id, Request $request){

        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }

            $chat = Chat::find($chat_id);
            if (is_null($chat) ){
                throw new \Exception('no chat');
            }
            $data = $request->all();

                $post = $chat->addPost($data, $user->id);


            if ( is_null($post) ){
                throw new \Exception('problem with add  message');
            }

            return response()->json(['success'=>true,'post'=>$post->toArray(),'chat'=>$chat->toArray()]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }

    }


    public function sound($chat_id, Request $request){

        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }

            $chat = Chat::find($chat_id);
            if (is_null($chat) ){
                throw new \Exception('no chat');
            }
            $data = $request->all();


            $chat->updateSound($user->id, $data['enable']);


            return response()->json(['success'=>true]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }

    }

    public function removePost($id){
        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }

            $post = ChatPost::find($id);
            if (is_null($post) ){
                throw new \Exception('no post');
            }
            if ( $post->user_id!=$user->id){
                throw new \Exception('no access');

            }
            $post->remove();

            $post->Chat->updateLastPost();
            return response()->json(['success'=>true]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }

    public function updatePost($id, Request $request){
        try{
            $data = $request->all();
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                JWTAuth::invalidate(JWTAuth::getToken());
                throw new \Exception('no user');
            }

            $post = ChatPost::find($id);
            if (is_null($post) ){
                throw new \Exception('no post');
            }
            if ( $post->user_id!=$user->id){
                throw new \Exception('no access');

            }
            $post->update(['message'=>$data['message']]);

           // $post->Chat->updateLastPost();
            return response()->json(['success'=>true,'post'=>$post->toArray()]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }

    public function clear($chat_id){

        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                throw new \Exception('no user');
            }
            if ( $user->can_edit_myself=='0' ){
                throw new \Exception('Access Error');
            }
            $chat = Chat::find($chat_id);
            if (is_null($chat) ){
                throw new \Exception('no chat');
            }
            $chat->clearAllPosts($user->id);
            return response()->json(['success'=>true]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }

    }

    public function remove($chat_id){

        try{
            $user = JWTAuth::parseToken()->authenticate();
            if ( is_null($user) ){
                throw new \Exception('no user');
            }
            if ( $user->is_delete=='1' ){
                throw new \Exception('no user');
            }
           /* if ( $user->can_edit_myself=='0' ){
                throw new \Exception('Access Error');
            }*/
            $chat = Chat::find($chat_id);
            if (is_null($chat) ){
                throw new \Exception('no chat');
            }
            $chat->remove();
            return response()->json(['success'=>true]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }

    }

}
