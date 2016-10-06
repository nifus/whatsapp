(function (angular) {
    'use strict';

    angular.module('chatApp').
    controller('profileController', profileController);

    profileController.$inject = ['$scope', 'userFactory', '$state'];
    function profileController($scope, userFactory, $state) {
        $scope.model={

        };
        $scope.$watch('user', function(value){
            if (value!=null){
               $scope.model = value
            }
        });



    }
})(angular);