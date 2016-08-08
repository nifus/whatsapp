(function (angular, window) {
    'use strict';
    angular.module('core').service('chatService', chatService);
    chatService.$inject = ['$http', '$cookies', '$q', 'userFactory','postFactory'];

    function chatService($http, $cookieStore, $q, userFactory, postFactory) {
        return function (data) {
            var Object = data;
            Object.waiting = false;
            return init(Object);
        };

        function init(Object){
            var promises = [];
            var current_usr = null;
            return $q(function(resolve){

                Object.UsersList = [];
                for(var i in Object.members){
                    promises.push( userFactory.getById(Object.members[i]).then(function(user){
                        Object.UsersList.push( user );
                    }) )
                }
                promises.push( postFactory.getById(Object.last_post).then(function(post){
                    Object.LastPost = post;
                }) );

                promises.push( userFactory.getCurUsr().then(function(user){
                    current_usr = user;
                }) );

                $q.all(promises).then(function () {


                    for( var i in Object.UsersList ){
                        if (Object.UsersList[i].id!=current_usr.id){
                            Object.ChatUsr = Object.UsersList[i]
                        }
                    }


                    resolve(Object);


                });
            })
        }
    }
})(angular, window);

