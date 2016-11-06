(function (angular, window) {
    'use strict';
    angular.module('core').service('postService', postService);
    postService.$inject = ['$http','socket'];

    function postService( $http, socket) {
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
                    socket.emit('message-delete', {chat_id:Object.chat_id, post_id: Object.id});
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

