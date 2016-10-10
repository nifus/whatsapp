(function (angular) {
    'use strict';

    angular.module('chatApp').
    controller('groupController', groupController);

    groupController.$inject = ['$scope'];
    function groupController($scope) {
        $scope.env= {
            contacts: []
        };

        $scope.model={
            contacts:[]
        };
        $scope.step = 'one';


        $scope.$watch('user.contacts', function(value){
            if (value){
                $scope.env.contacts = value;
            }
        });


        $scope.selectContact = function(contact, index){
            $scope.model.contacts.push(contact);
             $scope.env.contacts.splice(index,1)
        };
        $scope.removeContact = function(contact, index){
            $scope.env.contacts.push(contact);
             $scope.model.contacts.splice(index,1)
        }
    }
})(angular);