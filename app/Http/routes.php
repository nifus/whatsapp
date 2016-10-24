<?php


Route::get('/', ['as' => 'signin', 'uses' => 'SignInController@index']);
//Route::get('signup', ['as' => 'signup', 'uses' => 'SignUpController@index']);
Route::get('signout', ['as' => 'signout', 'uses' => 'User\SignOutController@index']);



    Route::group(['prefix' => 'backend/user'], function () {
        Route::post('/authenticate', 'Api\UserController@authenticate');
        Route::get('/get-auth', 'Api\UserController@getAuth')->middleware('updateLastAction');

        Route::get('/get-all', 'Api\UserController@getAll');
        Route::get('/contacts', 'Api\UserController@getContacts');
        Route::get('/chats', 'Api\UserController@getChats');
        Route::get('/{id}', 'Api\UserController@getById')->where('id', '[0-9]*');

        Route::post('/', 'Api\UserController@store')->middleware('updateLastAction');

        Route::delete('/{id}', 'Api\UserController@delete')->where('id', '[0-9]*')->middleware('updateLastAction');
        Route::post('/{id}/restore', 'Api\UserController@restore')->where('id', '[0-9]*')->middleware('updateLastAction');
        Route::get('/logout', 'Api\UserController@logout')->middleware('updateLastAction');
        Route::post('/{id}', 'Api\UserController@update')->where('id', '[0-9]*')->middleware('updateLastAction');

        Route::get('/update-token', 'Api\UserController@updateToken');
        Route::get('/get-last-action/{user_id}', 'Api\UserController@getLastAction')->where('user_id', '[0-9]*');
        Route::put('/set-status/{status}', 'Api\UserController@setStatus')->where('user_id', '[0-9]*')->middleware('updateLastAction');
    });


    Route::group(['prefix' => 'chats'], function () {
        Route::post('/', 'Api\ChatController@store')->middleware('updateLastAction');
        Route::post('/{id}', 'Api\ChatController@loadChat')->where('id', '[0-9]*')->middleware('updateLastAction');
        Route::get('/{id}', 'Api\ChatController@getById')->where('id', '[0-9]*');
        Route::get('/{id}/status', 'Api\ChatController@chatStatus')->where('id', '[0-9]*');
        Route::put('/{id}/read', 'Api\ChatController@chatRead')->where('id', '[0-9]*')->middleware('updateLastAction');
        Route::post('/{id}/around/{post_id}', 'Api\ChatController@loadChatAroundId')->where('id', '[0-9]*')->where('post_id','[0-9]*')->middleware('updateLastAction');
        Route::post('/{id}/down/{post_id}', 'Api\ChatController@loadChatDown')->where('id', '[0-9]*')->where('post_id','[0-9]*')->middleware('updateLastAction');
        Route::put('/{id}', 'Api\ChatController@updateChat')->where('id', '[0-9]*')->middleware('updateLastAction');
        Route::get('/search/{key}', 'Api\ChatController@search');

        Route::post('/group', 'Api\ChatController@addGroup');
        Route::post('/{id}/add-post', 'Api\ChatController@addPost')->where('id', '[0-9]*');
        Route::post('/{id}/sound', 'Api\ChatController@sound')->where('id', '[0-9]*');
        Route::post('/{id}/clear', 'Api\ChatController@clear')->where('id', '[0-9]*');
        Route::delete('/{id}', 'Api\ChatController@remove')->where('id', '[0-9]*');
        Route::delete('/{chat_id}/{member_id}', 'Api\ChatController@removeMember')->where('chat_id', '[0-9]*')->where('member_id', '[0-9]*');
        Route::post('/{chat_id}/{member_id}', 'Api\ChatController@addMember')->where('chat_id', '[0-9]*')->where('member_id', '[0-9]*');

    });

    Route::group(['prefix' => 'posts'], function () {
        Route::delete('/{id}', 'Api\ChatController@removePost')->where('id', '[0-9]*');
        Route::put('/{id}', 'Api\ChatController@updatePost')->where('id', '[0-9]*');
    });

    Route::group(['prefix' => 'backend/config'], function () {
        Route::put('/', 'Api\ConfigController@update');
    });