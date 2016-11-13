(function () {
    'use strict';
    angular.module('chatApp').controller('leftController', leftController);

    leftController.$inject = ['$scope','chatFactory','socket'];

    function leftController($scope, chatFactory, socket) {
        console.log($scope.env);


        $scope.env = {
            step : 'one',
            waiting: false,
            search_activated: false,
            search_key: undefined,
            contacts:[]
        };

        $scope.dialog = 'chats';

        $scope.openProfile = function () {
            $scope.env.search_key = null;
            $scope.dialog = 'profile';
            $scope.model = {
                name: $scope.user.name,
                avatar: $scope.user.avatar
            }
        };

        $scope.saveProfile = function (data) {
            $scope.user.updateProfile(data).then(function (response) {
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Изменения сохранены');
                }
            })
        };

        $scope.openGroupDialog = function () {
            $scope.dialog = 'group';
            $scope.model = {
                contacts:[]
            };
            $scope.env.step = 'one';
            $scope.env.contacts = angular.copy($scope.user.contacts)
        };

        $scope.openContactList = function () {
            $scope.dialog = 'contactList';
        };

        $scope.openChatsDialog = function () {
            $scope.env.search_key = undefined;
            $scope.dialog = 'chats';
        };
        $scope.openContacts = function () {
            $scope.env.search_key = undefined;
            $scope.dialog = 'contacts';
        };

        $scope.selectContact = function(contact, index){
            $scope.model.contacts.push(contact);
            $scope.env.contacts.splice(index,1)
        };

        $scope.removeContact = function(contact, index){
            $scope.env.contacts.push(contact);
            $scope.model.contacts.splice(index,1)
        };

        $scope.saveGroup = function (data) {
            $scope.env.waiting = true;
            $scope.openChatsDialog();
            chatFactory.createGroup(data).then(function (response) {
                $scope.env.waiting = false;
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Группа создана');
                    $scope.user.chats.push(response.chat);
                    socket.emit('client:create-chat', response.chat.id, data.contacts);
                }
            })
        };

        $scope.createChat = function (contact) {
            $scope.dialog = 'chats';
            chatFactory.createByContact($scope.user, contact).then(function (response) {
                if (response.success != false) {
                    $scope.user.chats.push(response.chat);
                    //$scope.chat = ;
                    $scope.$parent.loadChat(response.chat, null);
                    socket.emit('client:create-chat', response.chat.id, [contact.id]);
                } else if (response.chat_id) {
                    var chat = $scope.user.chats.filter(function (chat) {
                        if (chat.id == response.chat_id) {
                            return true;
                        }
                        return false;
                    })[0];
                    $scope.$parent.loadChat(chat, null);
                }
            });
            $scope.contact_list = false;
        };

        $scope.openChat = function (chat, post_id) {
            $scope.$parent.loadChat(chat, post_id);
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


        $scope.$watchCollection('$parent.env.who_is_online', function(value){
           $scope.env.who_is_online = value;
        })
    }

})();