(function() {
    'use strict';
    angular
        .module('backApp')
        .controller('eventListController', usersListController);

    usersListController.$inject=['$scope', 'userFactory', '$filter', '$q', 'eventFactory'];

    function usersListController($scope, userFactory, $filter, $q, eventFactory) {


        $scope.env = {
            loading:true,
            user: null,
            events: [],
            eventsSource: [],
            tableConfig: {
                itemsPerPage: 50,
                fillLastPage: false
            }
        };

        var userDeffer = userFactory.getAuthUser().then( function(user){
            $scope.env.user = user
        });

        var eventsDeffer = eventFactory.getAll().then( function(events){
            $scope.env.events = events;
            $scope.env.eventsSource = events;
        });


        $q.all([userDeffer, eventsDeffer]).then( function(){
            $scope.env.loading = false;
        });

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