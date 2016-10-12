(function () {
    'use strict';
    angular
        .module('chatApp')
        .controller('userListController', userListController);

    userListController.$inject = ['$scope', 'userFactory', '$filter', '$q'];

    function userListController($scope, userFactory, $filter, $q) {


        $scope.env = {
            user: null,
            users: [],
            usersSource: [],
            tableConfig: {
                itemsPerPage: 50,
                fillLastPage: false
            }
        };

        function initPage(deferred, env) {
            $scope.env.user = env.user;

        }

        $scope.$parent.init.push(initPage);
        userFactory.getAll().then(function (users) {
            $scope.env.users = users;
            $scope.env.usersSource = users;
        });

    }

})();