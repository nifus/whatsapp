(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('postFactory', postFactory);
    postFactory.$inject = ['postService', '$http'];

    function postFactory(postService, $http) {

        return {
            getPosts: getPosts,
            addPost: addPost
        };

        function addPost(message, chat_id) {
            return $http.post( '/chats/'+chat_id+'/add-post',{ message: message}).then(function (response) {
                if ( response.data.success==true ){
                    return {success: response.data.success, post: new postService(response.data.post)};
                }else{
                    return {success: response.data.success, error: response.data.error};
                }
            })
        }

        function getPosts(id) {

            return $http.put( '/chats/'+id,{start:0,count:0}).then(function (response) {
                var result = [];
                for (var i in response.data.posts) {
                    result.push( new postService(response.data.posts[i]) );
                }
                return result;
            })


        }



    }


})(angular, window);



