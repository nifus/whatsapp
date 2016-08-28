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


        $scope.saveProfile = function(data){
            $scope.model.update(data).then(function(response){
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Измнения сохранены');
                }
            })
        }
    }
})(angular);