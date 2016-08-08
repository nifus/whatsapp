<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Agent;
use App\Company;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;

class CompanyController extends Controller
{




    public function getByAgent($id)
    {
        $rows = Company::getByAgent($id);
        return response()->json($rows->toArray());
    }

    public function getAll()
    {
        $rows = Company::getAll();
        return response()->json($rows->toArray());
    }

    public function getById($id)
    {
        try {
            $row = Company::findOrDie($id);
            return response()->json($row->toArray(), 200, [], JSON_NUMERIC_CHECK);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }


    public function store(Request $request)
    {
        $data = $request->all();
        try {
            $company = Company::createNewCompany($data, $data['agent_id']);
            if ( isset($data['company_accounts']) && is_array($data['company_accounts']) ){
                foreach($data['company_accounts'] as $account){
                    $company->addAccount($account);
                }
            }
            return response()->json(['success' => true, 'company'=>$company->toArray()]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function update($id, Request $request)
    {
        $data = $request->all();
        try {
            $company = Company::findOrDie($id)->updateExist($data);

            if ( isset($data['company_accounts']) && is_array($data['company_accounts']) ){

                foreach($data['company_accounts'] as $account){
                    if ( isset($account['id']) ){
                        $company->updateAccount($account['id'], $account);
                    }else{
                        $company->addAccount($account);
                    }
                }
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }


    public function delete($id)
    {
        try {
            Company::findOrDie($id)->delete();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function restore($id)
    {
        try {
            Company::findOrDie($id)->restore();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function uploadFile(Request $request){
        try{
            $data = $request->all();
            $answer = Company::uploadFile($data);
            return response()->json($answer);

        }catch( \Exception $e ){
            return response()->json(['success' => false,'error'=>$e->getMessage()]);
        }
    }

    public function deleteUploadFile($name, $key){
        try{
            Company::deleteUploadFile($name, $key);
            return response()->json(['success' => true]);
        }catch( \Exception $e ){
            return response()->json(['success' => false]);
        }
    }

    public function updateFiles($id, Request $request)
    {
        try {
            Company::findOrDie($id)->updateFiles($request->get('files'));
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

}
