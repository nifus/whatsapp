(function (angular) {
    'use strict';

    function leftDirective() {
        return {
            replace: true,
            restrict: 'E',
            controller: leftController,
            link: leftLink,
            templateUrl: 'apps/chatApp/directives/leftSide/left.html',
            scope: {
                user:'=',
                chat:'='
            }
        };

        leftController.$inject = ['$scope', '$state', 'userFactory', 'chatFactory','$q'];

        function leftLink($scope,element) {
        }
        function leftController($scope, $state, userFactory, chatFactory,$q) {
            $scope.env = {

            };
            $scope.show_contacts = true;
            $scope.show_profile = false;


            /*$scope.openProfile = function(){
                $scope.show_contacts=false;$scope.show_profile = true
            }
            $scope.openContacts = function(){
                $scope.show_contacts=true;$scope.show_profile = false
            };*/
            $scope.logout = function(){
                userFactory.logout();
            }


            $scope.openChat = function(chat){
                $scope.chat = chat
            }

            $scope.createChat = function(contact){
                $scope.chat = chatFactory.createByContact($scope.user, contact)
            }

        }


    }

    angular.module('chatApp').directive('left', leftDirective);


})(window.angular);
