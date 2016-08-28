<?php
namespace App\Http\Controllers\Api;

use App\Chat;
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


}
