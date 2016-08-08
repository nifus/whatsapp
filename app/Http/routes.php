<?php


Route::get('/', ['as' => 'signin', 'uses' => 'SignInController@index']);
//Route::get('signup', ['as' => 'signup', 'uses' => 'SignUpController@index']);
Route::get('signout', ['as' => 'signout', 'uses' => 'User\SignOutController@index']);



Route::group(['prefix' => 'backend/user'], function () {
    Route::post('/authenticate', 'Api\UserController@authenticate');
    Route::get('/get-auth', 'Api\UserController@getAuth');

    Route::get('/get-all', 'Api\UserController@getAll');
    Route::get('/{id}', 'Api\UserController@getById')->where('id', '[0-9]*');
    Route::put('/', 'Api\UserController@store');
    Route::delete('/{id}', 'Api\UserController@delete')->where('id', '[0-9]*');
    Route::post('/{id}/restore', 'Api\UserController@restore')->where('id', '[0-9]*');
    Route::get('/logout', 'Api\UserController@logout');
    Route::post('/{id}', 'Api\UserController@update');
    Route::get('/update-token', 'Api\UserController@updateToken');
});

Route::group(['prefix' => 'backend/config'], function () {
    Route::get('/', 'Api\ConfigController@get');
    Route::get('/currency', 'Api\ConfigController@getCurrencyList');
    Route::post('/', 'Api\ConfigController@update');
});


Route::group(['prefix' => 'chats'], function () {
    Route::get('/', 'Api\ChatController@index');
    Route::get('/{id}', 'Api\ChatController@posts');
});

Route::group(['prefix' => 'backend/group'], function () {
    Route::get('/get-all', 'Api\GroupController@getAll');
});

Route::group(['prefix' => 'backend/article'], function () {
    Route::get('/get-all', 'Api\ArticleController@getAll');
    Route::get('/{id}', 'Api\ArticleController@getById')->where('id', '[0-9]*');
    Route::delete('/{id}', 'Api\ArticleController@delete')->where('id', '[0-9]*');
    Route::post('/{id}', 'Api\ArticleController@update')->where('id', '[0-9]*');
    Route::put('/', 'Api\ArticleController@store');
});

Route::group(['prefix' => 'backend/agent'], function () {
    Route::get('/get-all', 'Api\AgentController@getAll');
    Route::get('/{id}', 'Api\AgentController@getById')->where('id', '[0-9]*');
    Route::delete('/{id}', 'Api\AgentController@delete')->where('id', '[0-9]*');
    Route::post('/{id}', 'Api\AgentController@update')->where('id', '[0-9]*');
    Route::post('/{id}/files', 'Api\AgentController@updateFiles')->where('id', '[0-9]*');
    Route::put('/', 'Api\AgentController@store');
    Route::put('/upload', 'Api\AgentController@uploadFile');
    Route::delete('/upload/{name}/{key}', 'Api\AgentController@deleteUploadFile');
});


Route::group(['prefix' => 'backend/company'], function () {
    Route::get('/agent/{id}', 'Api\CompanyController@getByAgent')->where('id', '[0-9]*');
    Route::get('/get-all', 'Api\CompanyController@getAll');
    Route::get('/{id}', 'Api\CompanyController@getById')
        ->where('id', '[0-9]*');

    Route::delete('/{id}', 'Api\CompanyController@delete')
        ->where('id', '[0-9]*');

    Route::post('/{id}', 'Api\CompanyController@update')
        ->where('id', '[0-9]*');

    Route::put('/', 'Api\CompanyController@store');
    Route::put('/upload/', 'Api\CompanyController@uploadFile');
    Route::delete('/upload/{name}/{key}', 'Api\CompanyController@deleteUploadFile');

    Route::post('/{id}/files', 'Api\CompanyController@updateFiles')->where('id', '[0-9]*');

    Route::get('/{company_id}/account/get-all', 'Api\CompanyAccountController@getAll')
        ->where('company_id', '[0-9]*');


    Route::delete('/{company_id}/account/{account_id}', 'Api\CompanyAccountController@delete')
        ->where('company_id', '[0-9]*')
        ->where('account_id', '[0-9]*');


});

Route::group(['prefix' => 'backend/log'], function () {
    Route::get('/{id}', 'Api\LogController@getById')->where('id', '[0-9]*');
    Route::get('/', 'Api\LogController@get');
});

Route::group(['prefix' => 'backend/payment'], function () {
    Route::get('/get-total-stat', 'Api\PaymentController@getTotalStat');
    Route::get('/get-next-number', 'Api\PaymentController@getNextNumber');
    Route::get('/get-all', 'Api\PaymentController@getAll');
    Route::get('/get-with-agent', 'Api\PaymentController@getRelatedWithAgent');
    Route::post('/remove-selected', 'Api\PaymentController@removeSelected');
    Route::get('/get-with-company', 'Api\PaymentController@getRelatedWithCompany');
    Route::get('/{id}', 'Api\PaymentController@getById')->where('id', '[0-9]*');
    Route::delete('/{id}', 'Api\PaymentController@delete')->where('id', '[0-9]*');
    Route::post('/{id}', 'Api\PaymentController@update')->where('id', '[0-9]*');
    Route::put('/', 'Api\PaymentController@store');
    Route::put('/upload', 'Api\PaymentController@uploadFile');
    Route::delete('/upload/{name}/{key}', 'Api\PaymentController@deleteUploadFile');
    Route::get('/pdf', 'Api\PaymentController@getPdf');
    Route::get('/file/{file}', 'Api\PaymentController@getFile');

});


//
View::composer(['index'], function ($view) {
    $user = null;//\Sentry::getUser();
    $view->with('composerHeaderMenu', View::make('composer.headerMenu', ['user' => $user]));
});


function a_basename( $file, $exts=null )
{
    $onlyfilename = end( explode( "/", $file ) );

    if( is_string( $exts ) )
    {
        if ( strpos( $onlyfilename, $exts, 0 ) !== false )
            $onlyfilename = str_replace( $exts, "", $onlyfilename );
    }
    else if ( is_array( $exts ) )
    {
        // works with PHP version <= 5.x.x
        foreach( $exts as $KEY => $ext )
        {
            $onlyfilename = str_replace( $ext, "", $onlyfilename );
        }
    }

    return $onlyfilename ;
}