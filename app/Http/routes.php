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
        Route::get('/get-status/{user_id}', 'Api\UserController@getStatus');
    });


    Route::group(['prefix' => 'chats'], function () {
        Route::post('/', 'Api\ChatController@store');
        Route::get('/{id}', 'Api\ChatController@loadChat');
        Route::put('/{id}', 'Api\ChatController@updateChat');

        Route::post('/group', 'Api\ChatController@addGroup');
        Route::post('/{id}/add-post', 'Api\ChatController@addPost');
        Route::post('/{id}/sound', 'Api\ChatController@sound');
        Route::post('/{id}/clear', 'Api\ChatController@clear');
        Route::delete('/{id}', 'Api\ChatController@remove');
        Route::delete('/{chat_id}/{member_id}', 'Api\ChatController@removeMember');
        Route::post('/{chat_id}/{member_id}', 'Api\ChatController@addMember');

    });

Route::group(['prefix' => 'posts'], function () {
    Route::delete('/{id}', 'Api\ChatController@removePost');
});