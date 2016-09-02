(function (angular) {
    'use strict';

    angular.module('chatApp').
    controller('groupController', groupController);

    groupController.$inject = ['$scope', 'chatFactory'];
    function groupController($scope, chatFactory) {
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

        $scope.saveGroup = function(data){
            chatFactory.createGroup(data).then(function(response){
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Группа создана');
                }
            })

        };
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