(function (angular, window) {
    'use strict';
    angular.module('core').service('postService', postService);
    postService.$inject = ['$http'];

    function postService( $http) {
        return function (data) {
            var Object = data;
            Object.waiting = false;

            Object.isMyselfMessage = function(user_id){
                if ( Object.user_id==user_id ){
                    return true;
                }
                return false;
            };

            Object.remove = function(){
                return $http.delete( '/posts/'+Object.id).then(function (response) {
                    return response.data;
                })
            };
            Object.update = function(msg){
                return $http.put( '/posts/'+Object.id,{'message':msg}).then(function (response) {
                    return response.data;
                })
            };


            return (Object);
        };


    }
})(angular, window);

