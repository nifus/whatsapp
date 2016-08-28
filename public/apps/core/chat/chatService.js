(function (angular, window) {
    'use strict';
    angular.module('core').service('chatService', chatService);
    chatService.$inject = ['postFactory'];

    function chatService( postFactory) {
        return function (data) {
            var Object = data;
            Object.waiting = false;

            Object.getPosts = function(){
                return postFactory.getPosts(Object.id)
            }
            return Object;
        };


    }
})(angular, window);

