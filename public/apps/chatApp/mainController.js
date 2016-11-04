(function () {
    'use strict';
    angular.module('chatApp').controller('mainController', mainController);

    mainController.$inject = ['$scope', '$q', 'userFactory', '$state', 'chatFactory', 'configFactory', 'socket', 'ngAudio', '$timeout', '$rootScope', '$auth' ,'$cookies','$filter'];

    function mainController($scope, $q, userFactory, $state, chatFactory, configFactory, socket, ngAudio, $timeout, $rootScope, $auth, $cookies, $filter) {
        $scope.env = {
            config: [],
            sound: ngAudio.load("audio/im.mp3"),
            user: null,
            connected: false,
            who_is_online:[]

        };

        $scope.chat = null;
        $scope.user = null;
        $scope.promises = [];
        $scope.initPromises = [];
        $scope.loaded = false;
        $scope.init = [];
        $scope.counter = 0;
        $scope.user_off = false;


        socket.on('who_is_online', function(array_ids){
           // console.log('who_is_online',array_ids)
            $scope.env.who_is_online = array_ids;
            if ($scope.chat!=null ){
                $scope.chat.setChatStatus($scope.user.id, $scope.env.who_is_online);
            }
        });
        window.onblur = function () {
            $scope.user_off = true;
            //$scope.user.setStatus('off');
        };
        window.onfocus = function () {
            $scope.user_off = false;
            //$scope.user.setStatus('on');

            if ($scope.chat) {
                $scope.chat.hasRead();
            }
        };

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
            user.token = $auth.getToken();
            $cookies.put('token', user.token);

            user.getAllContacts().then(function (contacts) {
                user.contacts = contacts;
            });
            if (user.history == '1') {
                chatFactory.getByUser(user.id).then(function (chats) {
                    user.chats = chats;
                    for( var i in user.chats ){
                        user.chats[i].posts = $filter('orderBy')(user.chats[i].posts, 'id');

                        user.chats[i].setLastPost( user.chats[i].posts[user.chats[i].posts.length-1] )

                    }
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
                if (chat.posts.length > 0) {
                    $timeout(function () {
                        if (chat.start_post) {
                            $scope.$emit('messages:scroll_to', chat.start_post);
                            $scope.env.download = true;
                        } else {
                            $scope.$emit('messages:scroll_down', chat.last_post_id);
                        }
                    }, 10)
                }
                $scope.$emit('open_chat', {});
                chat.hasRead();
            } else {
                chat.posts = [];
                $scope.chat.setLastPost(null);
            }

            chat.setChatStatus($scope.user.id, $scope.env.who_is_online);

            $scope.$emit('load_chat', {chat: chat, post_id: post_id});
        };


        socket.on('server:read_chat', function (chat_id) {
            $scope.user.chats.filter(function (chat) {
                if (chat_id == chat.id) {
                    chat.readChat()
                }
            });
        });

        socket.on('reload', function (obj) {
            var chat_id = obj.chat_id;
            $scope.env.user.chats.filter(function (chat) {
                if (chat.id == chat_id) {
                    var current_chat = ($scope.chat && chat.id == $scope.chat.id) ? true : false;
                    chat.updateInformation(current_chat, obj.post_id).then(function (response) {
                        $scope.$emit('messages:scroll_down', chat.last_post_id);
                        if (current_chat && $scope.user_off == false) {
                            chat.hasRead( chat.getUser($scope.user.id) );
                        }
                    });
                    if (chat.needPlayMusic($scope.env.user.id)) {
                        if ( $scope.env.sound.canPlay ){
                            $scope.env.sound.play();
                        }
                    }
                }
            })
        });


        socket.on('server:signin', function (user_id) {
            if (user_id == $scope.user.id) {
                window.location.reload(true)
            }
        });

        socket.on('create_chat', function (response) {
           // console.log('new chat');
            //console.log(response);
            for (var i in response.users) {
                if (response.users[i] == $scope.env.user.id) {
                    chatFactory.getById(response.chat).then(function (chat) {
                        //console.log(chat)
                        //console.log($scope.env.user.chats)
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
            //$scope.user.setStatus('off');

            userFactory.logout();
        }
    }
})();