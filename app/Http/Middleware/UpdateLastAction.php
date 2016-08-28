<?php

namespace App\Http\Middleware;

use Closure;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class UpdateLastAction
{
    public function handle($request, Closure $next)
    {
        try{
            $now_user = JWTAuth::parseToken()->authenticate();
            $now_user->updateLastAction();

        }catch( JWTException $e ){

        }




        return $next($request);
    }
}
