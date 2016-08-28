(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('postFactory', postFactory);
    postFactory.$inject = ['postService', '$http'];

    function postFactory(postService, $http) {

        return {
            getPosts: getPosts,
        };


        function getPosts(id) {

            return $http.put( '/chats/'+id,{start:0,count:0}).success(function (response) {
                var result = [];
                for (var i in response.data.posts) {
                    result.push( new postService(response.data.posts[i]) );
                }

                return result;
            })


        }



    }


})(angular, window);



