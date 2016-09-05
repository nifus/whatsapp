(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('userFactory', userFactory);
    userFactory.$inject = ['userService', '$http', '$auth', '$rootScope',  'cacheService'];

    function userFactory(userService, $http, $auth, $rootScope, cacheService) {

        return {
            refresh: refresh,
            getStatus: getStatus,
            isAuthenticated: isAuthenticated,
            login: login,
            logout: logout,
            register: register,
            getAuthUser: getAuthUser,
            getAll:getAll,
            getById:getById,
            store:store
        };

        function getStatus(user_id){
            return $http.get(window.SERVER+'/backend/user/get-status/'+user_id)

        }

        function refresh(){
            return $http.get(window.SERVER+'/backend/user/update-token').then( function(response){
                $auth.setToken(response.data.token)
            })
        }



        /**
         * Get UserService with current user
         * @returns promise
         */
        function getAuthUser(){
            var cache  = cacheService(
                function(){
                    $http.get(window.SERVER+'/backend/user/get-auth').success( function(response){
                        cache.end( userService(response) );
                    }).error( function(response){
                        cache.end( null );
                    })
                }, 'user_getAuthUser', 20
            );
            return cache.promise;
        }

        function getAll(){
            var cache  = cacheService(
               function(){
                   $http.get(window.SERVER+'/backend/user/get-all').success(function (answer) {
                       var users = [];
                       var i;
                       for( i in answer ){
                           users.push( userService(answer[i]) );
                       }
                       cache.end( users );
                   }).error(function (data, code) {
                       cache.end({success: false, error: data.error});
                   })
               }, 'user_getAllUsers', 10
            );
            return cache.promise;
        }



        function getById(id){
            var cache  = cacheService(
                function(){
                    $http.get(window.SERVER+'/backend/user/'+id).success(function (response) {
                        cache.end( userService(response) );
                    }).error( function(response){
                        cache.end( null );
                    })
                }, 'user_getById'
            );
            return cache.promise;
        }

        function register(data, callback) {
            $auth.signup(data).then(function (response) {
                if (response.data.success == false) {
                    callback({success: false, error: response.data.error})
                } else {
                    callback({success: true})

                }
            })
                .catch(function (response) {
                    callback({success: false, error: response.data.error})
                });
        }

        function logout() {
            $auth.logout();
            $rootScope.$broadcast('logout');
            window.location.href = '/';
        }

        function login(credentials, callback) {
            $auth.login(credentials).then(function (response) {
                $rootScope.$broadcast('login');
                callback({success: true, data: response.data});
            }).catch(function (response) {
                callback({success: false, error: response.data.error})
            });
        }

        function isAuthenticated() {
            if ($auth.isAuthenticated()) {
                return true;
            }
            return false;
        }

        function store(data) {
            return $http.post(window.SERVER+'/backend/user', data).then( function(response){
                return response.data;
            })
        }
    }


})(angular, window);



