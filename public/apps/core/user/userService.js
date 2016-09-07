(function (angular, window) {
    'use strict';
    angular.module('core').service('userService', userService);
    userService.$inject = ['$http'];

    function userService($http) {
        return function (data) {
            var Object = data;
            Object.waiting = false;



            Object.delete = function(){
                Object.waiting = true;
                return $http.delete(window.SERVER+'/backend/user/'+this.id).then(
                    function(response){
                        Object.waiting = false;
                        return response.data;
                    }
                )
            };
            Object.restore = function(){
                Object.waiting = true;
                return $http.post(window.SERVER+'/backend/user/'+this.id+'/restore').then(
                    function(response){
                        Object.waiting = false;
                        return response.data;
                    }
                )
            };
            Object.update = function(data){
                Object.waiting = true;
                return $http.post(window.SERVER+'/backend/user/'+this.id,data).then(
                    function(response){
                        Object.waiting = false;
                        if ( response.data.success==true ){
                            for( var i in response.data.user ){
                                Object[i] = response.data.user[i]
                            }
                        }
                        return response.data;
                    }
                )
            };

            Object.getAllContacts = function(){
                Object.waiting = true;
                return $http.get(window.SERVER+'/backend/user/contacts').then(
                    function(response){
                        Object.waiting = false;
                        return response.data;
                    }
                )
            };





            Object.hasAdminGroup = function(){
                if (Object.group_id==1){
                    return true;
                }
                return false;
            }

            return Object;
        }
    }
})(angular, window);

