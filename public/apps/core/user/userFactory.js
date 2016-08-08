(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('userFactory', userFactory);
    userFactory.$inject = ['userService', '$http', '$rootScope',  'cacheService', '$q'];

    function userFactory(userService, $http, $rootScope, cacheService, $q) {

        return {
           // refresh: refresh,
           // isAuthenticated: isAuthenticated,
           // login: login,
           // logout: logout,
           // register: register,
            getCurUsr: getCurUsr,
            getAll:getAll,
            getAuthUser: getAuthUser,
          //  getSuppliers: getSuppliers,
           // getLanguages:getLanguages,
           getById:getById,
            //store:store
        };

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


        function refresh(){
            return $http.get(window.SERVER+'/backend/user/update-token').then( function(response){
                $auth.setToken(response.data.token)
            })
        }



        /**
         * Get UserService with current user
         * @returns promise
         */
        function getAll(){
            var cache  = cacheService(
                function(){
                    $http.get(window.SERVER+'/public/data/users.json').success( function(response){
                        var result= [];
                        for(var i in response){
                            result.push( userService(response[i]) );
                        }
                        cache.end( result );
                    }).error( function(response){
                        cache.end( null );
                    })
                }, 'user_get_all_users', 20
            );
            return cache.promise;
        }

        function getById(id){

            return $q(function(resolve){
                getAll().then( function(result){
                    for(var i in result){
                        if ( result[i].id==id){
                            resolve(result[i])
                        }
                    }
                })
            })

        }

        function getCurUsr() {
            return getById(1);
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
            return $http.put(window.SERVER+'/backend/user', data).then( function(response){
                return response.data;
            })
        }
    }


})(angular, window);



