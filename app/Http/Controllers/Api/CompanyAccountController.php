<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\CompanyAccount;
use App\Company;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;

class CompanyAccountController extends Controller
{


    public function getAll($company_id)
    {
        $rows = CompanyAccount::getAll($company_id);
        return response()->json($rows->toArray(), 200, [], JSON_NUMERIC_CHECK);
    }

    public function getById($id)
    {
        $row = CompanyAccount::find($id);
        return response()->json($row->toArray(), 200, [], JSON_NUMERIC_CHECK);
    }


    public function store($company_id, Request $request)
    {
        try {
            //$user = User::getUser();
            $data = $request->all();
            $company = Company::find($company_id);
            $account = $company->addAccount($data);
            return response()->json(['success' => true,'account'=>$account]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function update($company_id,$account_id, Request $request)
    {
        try {
            $item = CompanyAccount::find($account_id);
            if (is_null($item)) {
                Abort(404);
            }
            $item->updateExist($request->all());
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }


    public function delete($company_id,$account_id)
    {
        $item = CompanyAccount::find($account_id);
        if (is_null($item)) {
            Abort(404);
        }
        $item->delete();
        return response()->json(['success' => true]);
    }
/*
    public function restore($id)
    {
        $item = Company::find($id);
        if (is_null($item)) {
            Abort(404);
        }
        $item->restore();
        return response()->json(['success' => true]);
    }*/


}
