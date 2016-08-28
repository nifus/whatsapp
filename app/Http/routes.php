<?php


Route::get('/', ['as' => 'signin', 'uses' => 'SignInController@index']);
//Route::get('signup', ['as' => 'signup', 'uses' => 'SignUpController@index']);
Route::get('signout', ['as' => 'signout', 'uses' => 'User\SignOutController@index']);



    Route::group(['prefix' => 'backend/user'], function () {
        Route::post('/authenticate', 'Api\UserController@authenticate')->middleware('updateLastAction');
        Route::get('/get-auth', 'Api\UserController@getAuth')->middleware('updateLastAction');

        Route::get('/get-all', 'Api\UserController@getAll');
        Route::get('/contacts', 'Api\UserController@getContacts');
        Route::get('/chats', 'Api\UserController@getChats');
        Route::get('/{id}', 'Api\UserController@getById')->where('id', '[0-9]*');

        Route::post('/', 'Api\UserController@store');

        Route::delete('/{id}', 'Api\UserController@delete')->where('id', '[0-9]*');
        Route::post('/{id}/restore', 'Api\UserController@restore')->where('id', '[0-9]*');
        Route::get('/logout', 'Api\UserController@logout');
        Route::post('/{id}', 'Api\UserController@update');
        Route::get('/update-token', 'Api\UserController@updateToken');
    });


    Route::group(['prefix' => 'chats'], function () {
        Route::put('/{id}', 'Api\ChatController@loadChat');
    });

