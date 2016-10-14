(function (angular) {
    'use strict';

    function leftDirective() {
        return {
            replace: true,
            restrict: 'E',
            controller: leftController,
            templateUrl: 'apps/chatApp/directives/leftSide/left.html',
            scope: {
                user: '=',
                chat: '='
            }
        };

        leftController.$inject = ['$scope', 'userFactory', 'chatFactory', 'socket','$timeout'];



        function leftController($scope, userFactory, chatFactory,  socket, $timeout) {
            $scope.dialog = 'contacts';


            $scope.openChat = function (chat, post_id) {
                $scope.$parent.$parent.loadChat(chat, post_id);
            };

            $scope.openContactList = function () {
                $scope.dialog = 'contactList';
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
                $scope.user.setStatus('off');
                $timeout(function(){
                    userFactory.logout();
                },10)
            };




            $scope.getChat = function (chat_id) {
                var result = $scope.user.chats.filter(function (chat) {
                    if (chat_id == chat.id) {
                        return true;
                    }
                    return false
                });
                if (result[0] != undefined) {
                    return result[0];
                }
            };

            $scope.createChat = function (contact) {

                $scope.dialog = 'contacts';
                chatFactory.createByContact($scope.user, contact).then(function (response) {
                    if (response.success != false) {
                        $scope.user.chats.push(response.chat);
                        //$scope.chat = ;
                        $scope.$parent.$parent.loadChat(response.chat, null);
                        //socket.emit('chat', response.chat.id, [$scope.user.id, contact.id]);
                    } else if (response.chat_id) {
                        var chat = $scope.user.chats.filter(function (chat) {
                            if (chat.id == response.chat_id) {
                                return true;
                            }
                            return false;
                        })[0];
                        $scope.$parent.$parent.loadChat(chat, null);
                    }
                });
                $scope.contact_list = false;
            };

            $scope.saveProfile = function (data) {
                $scope.user.update(data).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        alertify.success('Изменения сохранены');
                        console.log(response)
                    }
                })
            };

            $scope.saveGroup = function (data) {
                var save_data = angular.copy(data);
                chatFactory.createGroup(save_data).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        alertify.success('Группа создана');
                        $scope.openContacts();
                        $scope.user.chats.push(response.chat);
                        var users = [];
                        for( var i in data.contacts ){
                            users.push( data.contacts[i].id )
                        }
                        socket.emit('chat', response.chat.id, users);

                    }
                })

            };
        }


    }

    angular.module('chatApp').directive('left', leftDirective);


})(window.angular);
