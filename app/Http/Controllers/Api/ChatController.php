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


    public function loadChat($id, Request $request){
        $data = $request->all();

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
        $posts = $chat->getPosts($data['start'],$data['count']);
        return response()->json(['success'=>true,'posts'=>$posts->toArray()]);

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
            $post = $chat->addPost($data['message'], 'text', $user->id);
            if ( is_null($post) ){
                throw new \Exception('problem with add  message');
            }

            return response()->json(['success'=>true,'post'=>$post->toArray()]);

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
            return response()->json(['success'=>true]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }

}
