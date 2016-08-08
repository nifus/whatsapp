(function (angular) {
    'use strict';

    angular.module('frontApp').
    controller('signInController', signInController);

    signInController.$inject = ['$scope', 'userFactory'];
    function signInController($scope, userFactory) {
        $scope.model = {};
        $scope.env = {
            waiting: false
        };

        userFactory.getAuthUser().then( function(user){
            if (user != null) {
                window.location.href = user.DashboardUrl
            }
        });

        $scope.signIn = function (email, password) {
            $scope.env.waiting = true;
            userFactory.login({email: email, password: password}, function (answer) {
                $scope.env.waiting = false;
                if (answer.error != undefined) {
                    $scope.env.error = answer.error
                } else {
                    userFactory.getAuthUser().then( function(user){
                        if (user != null) {
                            window.location.href = user.DashboardUrl
                        }
                    });
                }
            })
        }
    }
})(angular);