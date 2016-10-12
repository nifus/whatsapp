(function (angular) {
    'use strict';

    function topMenuDirective() {
        return {
            replace: true,
            restrict: 'E',
            controller: topMenuController,
            templateUrl: 'apps/chatApp/directives/topMenu/topMenu.html',
        };

        topMenuController.$inject = ['$scope', 'userFactory'];



        function topMenuController($scope, userFactory) {
            $scope.logout = function(){
                userFactory.logout();
                window.location.href='/'
            }
        }


    }

    angular.module('chatApp').directive('topMenu', topMenuDirective);


})(window.angular);
