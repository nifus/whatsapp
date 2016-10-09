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
                userFactory.logout();
            };


            $scope.openChat = function (chat, post_id) {
                chat.start_post = post_id;
                $scope.chat = chat;
                $scope.chat.CountUnreadMessages = 0;
                //console.log(chat)
                /*var posts = $scope.chat.posts;
                if (posts!=undefined && posts.length>0){
                    for( var i in posts ){
                        if ( posts[i].id==post_id){
                            console.log('ID!!!')
                            break;
                        }
                    }
                }*/

            };
            $scope.getChat = function (chat_id) {
                var result = $scope.user.chats.filter( function(chat){
                    if (chat_id==chat.id){
                        return true;
                    }
                    return false
                });
                if (result[0]!=undefined){
                    return result[0];
                }
            };

            $scope.createChat = function (contact) {
                $scope.dialog = 'contacts';
                chatFactory.createByContact($scope.user, contact).then(function (response) {
                    if ( response.success!=false){
                        $scope.user.chats.push(response.chat);
                        $scope.chat = response.chat;
                    }else if(response.chat_id){
                        $scope.chat = $scope.user.chats.filter( function(chat){
                            if (chat.id==response.chat_id){
                                return true;
                            }
                            return false;
                        })[0]
                    }
                });
                $scope.contact_list = false;
            };

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
