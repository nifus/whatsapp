<?php
namespace App\Http\Controllers\Api;

use App\Chat;
use App\ChatPost;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;

use App\User;




class ConfigController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', []);
    }





    public function update(Request $request){
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

            file_put_contents( public_path('config.json'), json_encode(['intro', $data['intro']]) );

            return response()->json(['success'=>true]);

        }catch( \Exception $e ){
            return response()->json(['success'=>false,'error'=>$e->getMessage()]);

        }
    }



}
