(function () {
    'use strict';
    angular.module('chatApp').controller('mainController', mainController);

    mainController.$inject = ['$scope', '$q', 'userFactory', '$state', 'chatFactory', 'configFactory', 'socket', 'ngAudio', '$timeout','$rootScope'];

    function mainController($scope, $q, userFactory, $state, chatFactory, configFactory, socket, ngAudio, $timeout, $rootScope) {
        $scope.env = {
            config: [],
            sound: ngAudio.load("audio/im.mp3"),
            user: null
        };

        $scope.chat = null;
        $scope.user = null;
        $scope.promises = [];
        $scope.initPromises = [];
        $scope.loaded = false;
        $scope.init = [];
        $scope.counter = 0;


        var configPromise = configFactory.get().then(function (response) {
            $scope.env.config = response;
        });
        $scope.promises.push(configPromise);

        var userPromise = userFactory.getAuthUser().then(function (user) {
            $scope.env.user = user;
            $scope.user = user;
            if (!user) {
                $state.go('sign_in');
                return false;
            }
            if (user.hasAdminGroup()) {
                $state.go('users');
                return false;
            }

            user.getAllContacts().then(function (contacts) {
                user.contacts = contacts;
            });
            if (user.history == '1') {
                chatFactory.getByUser(user.id).then(function (chats) {
                    user.chats = chats;
                });
            } else {
                user.chats = [];
            }

        });
        $scope.promises.push(userPromise);


        $q.all($scope.promises).then(function () {
            $scope.loaded = true;
            execute();
        });


        $scope.loadChat = function (chat, post_id) {
            chat.StartPost = post_id;
            chat.CountUnreadMessages = 0;
            $scope.chat = chat;

            if ($scope.user.history == '1') {
                chat.loadPosts().then(function () {
                    if (chat.posts.length > 0) {
                        $timeout(function () {
                            if (chat.start_post) {
                                $scope.$emit('messages:scroll_to', chat.start_post);
                                $scope.env.download = true;
                            } else {
                                $scope.$emit('messages:scroll_down', chat.last_post_id);
                            }
                            $scope.$emit('open_chat', {});
                        }, 10)
                    }
                })
            } else {
                chat.posts = [];
                $scope.chat.setLastPost(null);
            }
            chat.getChatStatus($scope.user.id);


            $scope.$emit('load_chat', {chat: chat, post_id: post_id});
        };


        socket.on('client:read_chat', function (chat) {
            console.log('client:read_chat')
            console.log(chat)
        });

        socket.on('reload', function (obj) {
            console.log('new message')
            var chat_id = obj.chat_id;
            $scope.env.user.chats.filter(function (chat) {
                if (chat.id == chat_id) {

                    var current_chat = ($scope.chat && chat.id==$scope.chat.id) ? true : false;
                    console.log( current_chat)
                    chat.updateInformation(current_chat).then(function(response){
                        $scope.$emit('messages:scroll_down', chat.last_post_id);
                    });
                    if (chat.needPlayMusic($scope.env.user.id)) {
                        $scope.env.sound.play();
                    }
                }
            })
        });

        socket.on('create_chat', function (response) {
            console.log('new chat');
            console.log(response);
            for (var i in response.users) {
                if (response.users[i] == $scope.env.user.id) {
                    chatFactory.getById(response.chat).then(function (chat) {
                        console.log(chat)
                        console.log($scope.env.user.chats)
                        $scope.env.user.chats.push(chat);
                        $scope.env.sound.play();
                    }, function (error) {
                        //console.log(error)
                    });
                    break;
                }
            }
        });

        //  в верхней позиции
        $rootScope.$on('messages:scroll_top', function () {
            console.log('messages:scroll_top')
            if ($scope.chat.is_posts_loading != false || $scope.chat.is_posts_loaded == true) {
                // сообщения уже грузятся или загрузились все
                return false;
            }
            $scope.chat.is_posts_loading = true;
            //$scope.chat.posts_start += 30;
            $scope.chat.getUpPosts().then(function (response) {
                if (response.length > 0) {
                    $scope.$emit('messages:scroll_to', response[0].id);

                }
            });

        });


        $scope.$watchCollection('init', function (value) {
            if ($scope.loaded == true) {
                execute();
            }
        }, true);


        function execute() {
            for (var i in $scope.init) {
                var deferred = $q.defer();
                var promise = $scope.init[i](deferred, $scope.env);
                $scope.init.splice(i, 1);
                $scope.initPromises.push(promise);
            }
        }

        $scope.$watchCollection('initPromises', function (value) {
            if (value != undefined && value.length > 0) {
                $scope.loaded = true;

                $scope.defer = $q.all($scope.initPromises).then(function () {
                    $scope.loaded = false;
                    $scope.initPromises = [];
                });
            }

        });

        $scope.logout = function () {
            userFactory.logout();
        }
    }
})();

