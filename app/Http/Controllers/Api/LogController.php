<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Log;
use App\User;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;

class LogController extends Controller
{

    public function getById($payment_id, Request $request)
    {
        $page = $request->has('page') ? $request->get('page') : 1;
        $limit = $request->has('count') ? $request->get('count') : 10;
        $filters = $request->has('filters') ? $request->get('filters') : [];
        $users = User::getAllUsers()->toArray();
        $usersById = [];
        foreach ($users as $user) {
            $usersById[$user['id']] = $user;
        }

        $rows = Log::getByPaymentAll($payment_id, $filters, $page, $limit)->toArray();
        for ($i = 0; $i < sizeof($rows); $i++) {
            $rows[$i]['user'] = $usersById[$rows[$i]['user_id']];
        }

        return response()->json(
            [
                'pagination' => [
                    'count' => $limit,
                    'page' => $page,
                    'size' => Log::countLogsByPayment($payment_id),
                ],
                'rows' => $rows,
                "sort-by" => "created_at",
                "sort-order" => "dsc",
            ]
        );

    }

    public function get(Request $request)
    {
        $page = $request->has('page') ? $request->get('page') : 1;
        $limit = $request->has('count') ? $request->get('count') : 10;
        $filters = $request->has('filters') ? $request->get('filters') : [];
        $users = User::getAllUsers()->toArray();
        $usersById = [];
        foreach ($users as $user) {
            $usersById[$user['id']] = $user;
        }

        $rows = Log::getAll($filters, $page, $limit)->toArray();
        for ($i = 0; $i < sizeof($rows); $i++) {
            $rows[$i]['user'] = $usersById[$rows[$i]['user_id']];
        }

        return response()->json(
            [
                'pagination' => [
                    'count' => $limit,
                    'page' => $page,
                    'size' => Log::countLogs(),
                ],
                'rows' => $rows,
                "sort-by" => "created_at",
                "sort-order" => "dsc",
            ]
        );

    }


}
