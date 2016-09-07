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
                user: '=',
                chat: '='
            }
        };

        leftController.$inject = ['$scope', 'userFactory', 'chatFactory', '$q'];

        function leftLink($scope, element) {
        }

        function leftController($scope, userFactory, chatFactory, $q) {
            $scope.dialog = 'contacts';


            $scope.openContactList = function () {
                $scope.contact_list = true;
            };

            $scope.openGroupDialog = function () {
                $scope.dialog = 'group';

            };
            $scope.openProfile = function () {
                $scope.dialog = 'profile';

            };

            $scope.openContacts = function () {
                $scope.dialog = 'contacts';
            };

            $scope.logout = function () {
                userFactory.logout();
            };


            $scope.openChat = function (chat) {
                $scope.chat = chat;
                $scope.chat.CountUnreadMessages = 0;
            };

            $scope.createChat = function (contact) {
                chatFactory.createByContact($scope.user, contact).then(function (response) {
                    $scope.chat = response;
                    $scope.user.chats.push(response);
                });
            }

            $scope.saveProfile = function(data){
                $scope.user.update(data).then(function(response){
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        alertify.success('Изменения сохранены');
                        console.log(response)
                    }
                })
            };

            $scope.saveGroup = function(data){
                var save_data = angular.copy(data);
                chatFactory.createGroup(save_data).then(function(response){
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        alertify.success('Группа создана');
                        $scope.openContacts();
                        $scope.user.chats.push(response.chat);

                    }
                })

            };
        }


    }

    angular.module('chatApp').directive('left', leftDirective);


})(window.angular);
