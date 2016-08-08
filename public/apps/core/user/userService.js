(function (angular, window) {
    'use strict';
    angular.module('core').service('userService', userService);
    userService.$inject = ['$http', '$cookies', '$q'];

    function userService($http, $cookieStore, $q) {
        return function (data) {
            var Object = data;
            Object.waiting = false;



            return Object;
        }
    }
})(angular, window);

