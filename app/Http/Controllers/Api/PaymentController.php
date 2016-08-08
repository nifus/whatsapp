<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Payment;
use App\Agent;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;

class PaymentController extends Controller
{

    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => []]);
    }

    public function getTotalStat()
    {
        $total = [];
        $agents = Agent::getAll();
        foreach ($agents as $agent) {
            if (!$agent->debt || sizeof($agent->debt) == 0) {
                continue;
            }
            foreach ($agent->debt as $cur => $data) {
                $total[$cur] = !isset($total[$cur]) ? ['debt_to_operator' => 0, 'debt_to_agent' => 0] : $total[$cur];
                $total[$cur]['debt_to_operator'] += $data->operator;
                $total[$cur]['debt_to_agent'] += $data->agent;
            }
        }
        return response()->json($total);
    }

    public function getNextNumber()
    {
        $max = Payment::getMaxId();
        $max++;
        // $number = str_pad($max, 10, "0", STR_PAD_LEFT);
        return response()->json($max);

    }

    public function getPdf(Request $request)
    {

        $cols = json_decode($request->get('cols'));
        $page = $request->has('page') ? $request->get('page') : 1;
        $limit = $request->has('count') ? $request->get('count') : 10;
        $article_id = $request->has('article_id') ? $request->get('article_id') : null;
        $supplier_agent_id = $request->has('supplier_agent_id') ? $request->get('supplier_agent_id') : null;
        $supplier_company_id = $request->has('supplier_company_id') ? $request->get('supplier_company_id') : null;
        $agent_id = $request->has('agent_id') ? $request->get('agent_id') : null;
        $profit = $request->has('profit') ? $request->get('profit') : null;
        $operator_profit = $request->has('operator_profit') ? $request->get('operator_profit') : null;
        $supplier_invoice = $request->has('supplier_invoice') ? $request->get('supplier_invoice') : null;
        $client_agent_id = $request->has('client_agent_id') ? $request->get('client_agent_id') : null;
        $client_company_id = $request->has('client_company_id') ? $request->get('client_company_id') : null;
        $client_invoice = $request->has('client_invoice') ? $request->get('client_invoice') : null;
        $begin_date = $request->has('begin_date') ? $request->get('begin_date') : null;
        $end_date = $request->has('end_date') ? $request->get('end_date') : null;
        $filters = [
            'article_id' => $article_id,
            'supplier_agent_id' => $supplier_agent_id,
            'supplier_company_id' => $supplier_company_id,
            'agent_id' => $agent_id,
            'profit' => $profit,
            'operator_profit' => $operator_profit,
            'supplier_invoice' => $supplier_invoice,
            'client_agent_id' => $client_agent_id,
            'client_company_id' => $client_company_id,
            'client_invoice' => $client_invoice,
            'begin_date' => $begin_date,
            'end_date' => $end_date,
        ];

        $agents = Agent::getAll();
        $agentsIds = [];
        foreach ($agents as $agent) {
            $agentsIds[$agent->id] = $agent;
        }

        $rows = Payment::getAll($filters, $page, $limit);

        $pdf = \PDF::loadView('pdf', ['rows' => $rows->toArray(), 'cols' => $cols, 'agents' => $agentsIds]);
        return $pdf->setPaper('a4', 'landscape')->download('payments.pdf');
        //return view('pdf',['rows'=>$rows->toArray(),'cols'=>$cols,'agents'=>$agentsIds]);
    }

    public function getRelatedWithAgent(Request $request)
    {
        $page = $request->has('page') ? $request->get('page') : 1;
        $limit = $request->has('count') ? $request->get('count') : 10;
        $article_id = $request->has('article_id') ? $request->get('article_id') : null;
        $agent_id = $request->has('agent_id') ? $request->get('agent_id') : null;
        $filters = [
            'article_id' => $article_id,
            'agent_id' => $agent_id,
        ];


        $rows = Payment::getRelatedWithAgent($filters, $page, $limit);
        return response()->json(
            [
                'pagination' => [
                    'count' => $limit,
                    'page' => $page,
                    'size' => Payment::getCount($filters),
                ],
                'rows' => $rows->toArray(),
                "sort-by" => "created_at",
                "sort-order" => "dsc",
            ]
        );
    }

    public function getRelatedWithCompany(Request $request)
    {
        $page = $request->has('page') ? $request->get('page') : 1;
        $limit = $request->has('count') ? $request->get('count') : 10;
        $article_id = $request->has('article_id') ? $request->get('article_id') : null;
        $company_id = $request->has('company_id') ? $request->get('company_id') : null;

        $filters = [
            'article_id' => $article_id,
            'company_id' => $company_id,
        ];
        $rows = Payment::getRelatedWithCompany($filters, $page, $limit);
        return response()->json(
            [
                'pagination' => [
                    'count' => $limit,
                    'page' => $page,
                    'size' => Payment::getCount($filters),
                ],
                'rows' => $rows->toArray(),
                "sort-by" => "created_at",
                "sort-order" => "dsc",
            ]
        );
    }

    public function getAll(Request $request)
    {
        $page = $request->has('page') ? $request->get('page') : 1;
        $limit = $request->has('count') ? $request->get('count') : 10;
        $article_id = $request->has('article_id') ? $request->get('article_id') : null;
        $supplier_agent_id = $request->has('supplier_agent_id') ? $request->get('supplier_agent_id') : null;
        $supplier_company_id = $request->has('supplier_company_id') ? $request->get('supplier_company_id') : null;
        $agent_id = $request->has('agent_id') ? $request->get('agent_id') : null;
        $profit = $request->has('profit') ? $request->get('profit') : null;
        $operator_profit = $request->has('operator_profit') ? $request->get('operator_profit') : null;
        $supplier_invoice = $request->has('supplier_invoice') ? $request->get('supplier_invoice') : null;
        $client_agent_id = $request->has('client_agent_id') ? $request->get('client_agent_id') : null;
        $client_company_id = $request->has('client_company_id') ? $request->get('client_company_id') : null;
        $client_invoice = $request->has('client_invoice') ? $request->get('client_invoice') : null;
        $begin_date = $request->has('begin_date') ? $request->get('begin_date') : null;
        $end_date = $request->has('end_date') ? $request->get('end_date') : null;
        $filters = [
            'article_id' => $article_id,
            'supplier_agent_id' => $supplier_agent_id,
            'supplier_company_id' => $supplier_company_id,
            'agent_id' => $agent_id,
            'profit' => $profit,
            'operator_profit' => $operator_profit,
            'supplier_invoice' => $supplier_invoice,
            'client_agent_id' => $client_agent_id,
            'client_company_id' => $client_company_id,
            'client_invoice' => $client_invoice,
            'begin_date' => $begin_date,
            'end_date' => $end_date,
        ];
        $rows = Payment::getAll($filters, $page, $limit);
        return response()->json(
            [
                'pagination' => [
                    'count' => $limit,
                    'page' => $page,
                    'size' => Payment::getCount($filters),
                ],
                'rows' => $rows->toArray(),
                "sort-by" => "created_at",
                "sort-order" => "dsc",
            ]
        );
    }

    public function getById($id)
    {
        $row = Payment::find($id);
        return response()->json($row->toArray(), 200, [], JSON_NUMERIC_CHECK);
    }


    public function store(Request $request)
    {
        $data = $request->all();
        try {
            //$user = User::getUser();
            $object = Payment::createNew($data);
            return response()->json(['success' => true, 'payment' => $object]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function update($id, Request $request)
    {
        try {
            $item = Payment::find($id);
            if (is_null($item)) {
                Abort(404);
            }

            $object = $item->updateExist($request->all());
            return response()->json(['success' => true, 'payment' => $object]);
        } catch (\Exception $e) {

            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function getFile($file){
        return response()->download(storage_path('uploads/payments/' . $file));
    }

    public function uploadFile(Request $request)
    {
        try {
            $data = $request->all();
            $answer = Payment::uploadFile($data);
            return response()->json($answer);

        } catch (\Exception $e) {
            return response()->json(['success' => false]);
        }
    }

    public function deleteUploadFile($name, $key)
    {
        try {
            Payment::deleteUploadFile($name, $key);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false]);
        }
    }

    public function removeSelected(Request $request){
        $data = $request->get('selected');
        if ( is_array($data) ){
            foreach($data as $id){
                $payment = Payment::find($id);
                if ($payment){
                    $payment->delete();
                }
            }
            Payment::rematchDebt();
        }
        return response()->json(['success' => true]);
    }


}
