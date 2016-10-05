(function (angular) {
    'use strict';

    angular.module('chatApp').controller('signInController', signInController);

    signInController.$inject = ['$scope', 'userFactory', '$state', '$cookies'];
    function signInController($scope, userFactory, $state, $cookies) {
        $scope.model = {};
        $scope.env = {
            waiting: false
        };

        userFactory.getAuthUser().then(function (user) {
            if (user != null) {
                if (user.hasAdminGroup()) {
                    $state.go('users');
                } else {
                    $state.go('chat');
                }
            }
        });

        $scope.signIn = function (login, password) {
            $scope.env.waiting = true;

            userFactory.login({login: login, password: password}, function (answer) {

                $scope.env.waiting = false;
                $cookies.put('session', answer.user.remember_token, {expires: moment().add(2, 'month').toDate()});
                if (answer.error != undefined) {
                    $scope.env.error = answer.error
                } else {
                    window.location.reload(true);
                }
            })
        }
    }
})(angular);