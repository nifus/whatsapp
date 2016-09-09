(function () {
    'use strict';
    angular.module('chatApp').controller('chatController', chatController);

    chatController.$inject = ['$scope', 'userFactory', '$q', 'chatFactory', 'hotkeys'];

    function chatController($scope, userFactory, $q, chatFactory, hotkeys) {
        var $promises = [];
        $scope.env = {
            agents: [],
            chat: undefined,
            show_add_info: false,
            chat_posts: [],
            message: null,
            imageDialog: false,
            upload: {
                image: null,
                message:null
            }
        };
        function initPage(deferred) {
            $scope.user = $scope.$parent.env.user;

            return deferred.promise;
        }

        // initPage();
        $scope.$parent.init.push(initPage);

        $scope.closeImageDialog = function(){
            $scope.env.imageDialog = false;
            $scope.env.upload = {};
        };

        $scope.addImagePost = function(model){
            $scope.env.chat.addImagePost(model.image, model.message).then(function (response) {
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    $scope.env.chat.posts.push(response.post);
                    $scope.closeImageDialog();
                }
            })
        }

        $scope.$watch('upload_image', function(value){
            if ( value ){
                $scope.env.imageDialog = true;
                $scope.env.upload.image = $scope.upload_image[0]
            }
        });

        $scope.$watch('env.chat', function (chat) {
            if (!chat) {
                return;
            }

            chat.getPosts().then(function (response) {
                chat.posts = response;
            });

            chat.getChatStatus($scope.user.id);
        });

        $scope.addMember = function(member){
            $scope.model.selected_member = null;
            //$scope.env.chat.members.push(member);
            $scope.model.members = $scope.model.members.filter( function(user){
                if (user.id!=member.id){
                    return true;
                }
                return false;
            });
            $scope.env.chat.addMember(member).then( function(response){
                if (response.success==true){
                    alertify.success('Пользователь добавлен');

                }else{
                    alertify.error(response.error);
                }
            })

        };

        $scope.closeInfoBlock = function(){
            $scope.env.show_add_info=false;
        };

        $scope.openInfoBlock = function (user) {
            $scope.env.show_add_info=true;
            $scope.env.add_info = user;

            $scope.model = angular.copy($scope.env.chat);
            $scope.model.members = $scope.user.contacts.filter( function(contact){
                for( var i in $scope.env.chat.members ){
                    if ( contact.id == $scope.env.chat.members[i].id ){
                        return false;
                    }
                }
                return true;
            });
        };

        $scope.changeChatAvatar = function(value){
            $scope.env.chat.updateAvatar(value)
        }

        $scope.changeChatName = function(value){
            if ( value!=''){
                $scope.env.chat.updateName(value)
            }
        };


        $scope.disableSound = function (chat, user) {
            chat.disableSound(user).then(function(response){
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Звук выключен');
                }
            })
        };

        $scope.enableSound = function (chat, user) {
            chat.enableSound(user).then(function(response){
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Звук включен');
                }
            })
        };

        $scope.clearChat = function (chat) {
            chat.clearChat().then(function(response){
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Чат очищен');
                }
            })
        };

        $scope.deleteChat = function (chat) {
            chat.deleteChat().then(function(response){
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Чат удален');
                    $scope.closeInfoBlock();
                    $scope.env.chat = null;
                    $scope.user.chats = $scope.user.chats.filter( function(el){
                        if (el.id==chat.id){
                            return false;
                        }
                        return true;
                    });

                }
            });


        };


        $scope.closeProfile = function(){
            $scope.env.show_add_info = false;
        };

        $scope.removeMember = function(user){
            $scope.model.members.push(user)

            $scope.env.chat.removeMember(user.id).then( function(response){
                if (response.success==true){
                    alertify.success('Пользователь удален');
                }else{
                    alertify.error(response.error);
                }
            })
        };

        hotkeys.add({
            combo: 'enter',
            action: 'keydown',
            description: 'This one goes to 11',
            callback: function () {
                var message = $scope.env.message;
                $scope.env.message = null;

                $scope.env.chat.addPost(message).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        $scope.env.chat.posts.push(response.post);
                           console.log(response.post)
                    }
                })
            },
            allowIn: ['textarea']
        });


    }
})();

