<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Mockery\CountValidator\Exception;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Group;



class GroupController extends Controller
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => []]);
    }



    public function getAll(){
        $users = Group::getAll();
        return response()->json($users->toArray() );
    }

    /*
    public function getById($id){
        $users = User::find($id);
        return response()->json($users->toArray() );
    }

    public function store(){
        $data = \Input::all();
        try{
            User::createNewActivatedUser($data);
            return response()->json(['success'=>true]);
        }catch( \Exception $e ){
            return response()->json(['success'=>false, 'error'=>$e->getMessage()]);
        }
    }*/

}
