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
            message: null
        };
        function initPage(deferred) {
            $scope.user = $scope.$parent.env.user;

            return deferred.promise;
        }

        // initPage();
        $scope.$parent.init.push(initPage);


        $scope.$watch('env.chat', function (chat) {
            if (!chat) {
                return;
            }

            chat.getPosts().then(function (response) {
                chat.posts = response;
                //$('div.messages').scrollTop(99999)
                console.log(response)
            })
        });


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

        };

        $scope.deleteChat = function (chat) {

        }
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

