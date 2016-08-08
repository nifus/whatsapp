<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Agent;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;

class AgentController extends Controller
{


    public function getAll()
    {
        $rows = Agent::getAll();
        return response()->json($rows->toArray());
    }

    public function getById($id)
    {
        try {
            $row = Agent::findOrDie($id);
            return response()->json($row->toArray(), 200, [], JSON_NUMERIC_CHECK );
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }


    public function store(Request $request)
    {
        $data = $request->all();
        try {
            $agent = Agent::createNew($data);
            return response()->json(['success' => true, 'agent'=>$agent->toArray()]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function update($id, Request $request)
    {
        try {
            Agent::findOrDie($id)->updateExist($request->all());
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function updateFiles($id, Request $request)
    {
        try {
            Agent::findOrDie($id)->updateFiles($request->get('files'));
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }


    public function delete($id)
    {
        try {
            Agent::findOrDie($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function restore($id)
    {
        try {
            Agent::findOrDie($id)->restore();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }

    }

    public function uploadFile(Request $request){
        try{
            $data = $request->all();
            $answer = Agent::uploadFile($data);
            return response()->json($answer);
        }catch( \Exception $e ){
            return response()->json(['success' => false, 'error'=>$e->getMessage()]);
        }
    }

    public function deleteUploadFile($name, $key){
        try{
            Agent::deleteUploadFile($name, $key);
            return response()->json(['success' => true]);
        }catch( \Exception $e ){
            return response()->json(['success' => false]);
        }
    }


}
