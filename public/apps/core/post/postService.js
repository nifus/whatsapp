(function (angular, window) {
    'use strict';
    angular.module('core').service('postService', postService);
    postService.$inject = [];

    function postService( ) {
        return function (data) {
            var Object = data;
            Object.waiting = false;
            return (Object);
        };


    }
})(angular, window);

