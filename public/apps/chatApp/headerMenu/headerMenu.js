(function (angular) {
    'use strict';

    function headerMenuDirective() {
        return {
            replace:true,
            restrict: 'E',
            controller:headerMenuController,
            templateUrl: 'apps/backApp/headerMenu/headerMenu.html',
            scope:{}
        };

        headerMenuController.$inject = ['$scope', 'userFactory', '$rootScope'];
        function headerMenuController($scope, userFactory, $rootScope){


            $scope.env={
                showLogin: false,
                user: undefined
            };

          //  $scope.$parent.$parent.initPage = initPage;
            function initPage(deferred, env){
                $scope.env.user = env.user
                console.log('header loaded')
            }
            $scope.$parent.init.push(initPage);



            $rootScope.$on('login', function() {
                auth();
            });
            $rootScope.$on('logout', function() {
                auth();
            });


            $scope.logout = function(){
                userFactory.logout();
            }
        }


    }

    angular.module('backApp').directive('headerMenu', headerMenuDirective);


})(window.angular);
