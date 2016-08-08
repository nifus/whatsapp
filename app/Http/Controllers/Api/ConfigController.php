<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Agent;


use App\Events\SignInErrorEvent;
use App\Events\SignInSuccessEvent;

class ConfigController extends Controller
{


    public function get()
    {
        $config = \Config::get('system');
        return response()->json($config);
    }


    public function getCurrencyList()
    {
        $currencies = ['RUB','USD','EUR','GBP'];
        return response()->json($currencies);
    }

    public function update(Request $request)
    {
        $config = $request->all();
        $name = config_path('system.php');

        file_put_contents($name,'<?php'."\n\r".' return '.var_export($config, true).';' );
        return response()->json(['success'=>true]);
    }
}
