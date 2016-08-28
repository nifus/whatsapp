(function() {
    'use strict';
    angular
        .module('chatApp')
        .controller('userListController', userListController);

    userListController.$inject=['$scope', 'userFactory', '$filter', '$q'];

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

        function initPage(deferred, env){


            $scope.env.user = env.user;

            var userDeffer = userFactory.getAuthUser().then( function(user){
                $scope.env.user = user
            });

            var usersDeffer = userFactory.getAll().then( function(users){
                $scope.env.users = users;
                $scope.env.usersSource = users;
            });


            $q.all([userDeffer, usersDeffer]).then( function(){
                deferred.resolve();
            });


            return deferred.promise;
        }

        $scope.$parent.init.push(initPage);



        $scope.delete = function(user, index){
            var res = confirm( $filter('translate')('Delete user?') );
            if ( !res ){
                return false;
            }
            user.delete().then( function(){
                userFactory.getById(user.id).then( function(user){
                    __update(user);
                    __reloadList();
                });
            });
        };

        $scope.restore = function(user, index){
            var res = confirm( $filter('translate')('Restore user?') );
            if ( !res ){
                return false;
            }
            user.restore().then( function(){
                userFactory.getById(user.id).then( function(user){
                    __update(user);
                    __reloadList();
                    //$scope.env.users = users;
                    //$scope.env.usersSource = users;
                });
            });
        };

        function filter(filters, users) {
            if (users == undefined) {
                return false;
            }
            return $filter("filter")(users, filters);
        }

        function __update(user){
            for( var i in $scope.env.usersSource ){
                if ( $scope.env.usersSource[i].id == user.id ){
                    $scope.env.usersSource[i] = user;
                }
            }
        }

        function __reloadList(){
            $scope.env.users = filter($scope.env.filters, $scope.env.usersSource)
        }

        $scope.$watchCollection('env.filters', function (value) {
            __reloadList();
        }, true)

    }

})();