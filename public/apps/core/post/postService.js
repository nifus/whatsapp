(function (angular, window) {
    'use strict';
    angular.module('core').service('postService', postService);
    postService.$inject = ['$http', '$cookies', '$q', 'userFactory'];

    function postService($http, $cookieStore, $q, userFactory, postFactory) {
        return function (data) {
            var Object = data;
            Object.waiting = false;
            return init(Object);
        };

        function init(Object){
            var promises = [];
            return $q(function(resolve){


                /*for(var i in Object.members){
                    promises.push( userFactory.getById(Object.members[i]).then(function(user){
                        Object.UsersList.push( user );
                    }) )
                }*/
                promises.push( userFactory.getById(Object.author).then(function(user){
                    Object.Author = user;

                }) );

                $q.all(promises).then(function () {
                    resolve(Object)
                });
            })
        }
    }
})(angular, window);

