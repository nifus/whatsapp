(function () {
    'use strict';
    angular.module('chatApp').controller('chatController', chatController);

    chatController.$inject = ['$scope', '$timeout', '$rootScope', 'socket', 'ngAudio', 'chatFactory','postFactory'];

    function chatController($scope, $timeout, $rootScope, socket, ngAudio, chatFactory, postFactory) {

        $scope.more = false;
        $scope.env = {
            adding_file: false,
            show_add_info: false,
            chat_posts: [],
            message: null,
            imageDialog: false,
            upload: {
                image: null,
                message: null
            },
            selected_post: null,
            edit_post: null,
            loading: false,
            start: 0,
            show_smiles: false,
            download: false,
            connected: true,
            sound: ngAudio.load("audio/im.mp3"),
            who_is_online: []
        };

        $scope.user = null;
        $scope.chat = null;
        $scope.config = null;


        function initPage(deferred) {
            $scope.env.connected = socket.connect().connected;
            $scope.user = $scope.$parent.user;
            $scope.config = $scope.$parent.config;

            socket.emit('client:connect', $scope.user.id);
            return deferred.promise;
        }

        $scope.$parent.init.push(initPage);


        socket.on('server:read_chat', function (chat_id) {
            $scope.user.chats.filter(function (chat) {
                if (chat_id == chat.id) {
                    chat.readChat()
                }
            });
        });

        socket.on('reload', function (obj) {
            var chat_id = obj.chat_id;
            $scope.user.chats.filter(function (chat) {
                if (chat.id == chat_id) {
                    var current_chat = ($scope.chat && chat.id == $scope.chat.id) ? true : false;
                    chat.updateInformation(current_chat, obj.post_id).then(function (response) {
                        $scope.$emit('messages:scroll_down', chat.last_post_id);
                        if (current_chat && $scope.user_off == false) {
                            chat.hasRead(chat.getUser($scope.user.id));
                        }
                    });
                    if (chat.needPlayMusic($scope.user.id)) {
                        if ($scope.env.sound.canPlay) {
                            $scope.env.sound.play();
                        }
                    }
                }
            })
        });

        socket.on('message:delete', function (obj) {
            angular.forEach($scope.user.chats, function (chat) {
                if (chat.id != obj.chat_id) {
                    return;
                }
                chat.posts = chat.posts.filter(function (post) {
                    if (post.id != obj.post_id) {
                        return true;
                    }
                    return false;
                });
                chat.setLastPost(chat.findLastPost())
            });
        });

        socket.on('message:edit', function (obj) {
            angular.forEach($scope.user.chats, function (chat) {
                if (chat.id != obj.chat_id) {
                    return;
                }
                for( var i in chat.posts){
                    if (chat.posts[i].id==obj.post_id){
                        var change_post = i;
                        postFactory.getPostById(obj.post_id).then(function (response) {
                            chat.posts[change_post] = response;
                        });
                        break
                    }
                }
            });
        });

        socket.on('who_is_online', function (users) {
            var online = []
            for (var i in users) {
                online.push(users[i].user);
            }
            $scope.env.who_is_online = online;
            if ($scope.chat != null) {
                $scope.chat.setChatStatus($scope.user.id, $scope.env.who_is_online);
            }
        });

        socket.on('server:create-chat', function (chat) {
            console.log('server:create-chat')
            console.log(chat)
            // for (var i in response.users) {
            //     if (response.users[i] == $scope.user.id) {
            chatFactory.getById(chat).then(function (chat) {
                //console.log(chat)
                //console.log($scope.env.user.chats)
                $scope.user.chats.push(chat);
                $scope.env.sound.play();
                // }, function (error) {
                //console.log(error)
            });
            // break;
            // }
            // }
        });

        socket.on('disconnect', function () {
            console.log('Связь с сервером потеряна');
            $scope.env.connected = false;
        });

        socket.on('connect', function () {
            console.log('Связь с сервером установлена');
            $scope.env.connected = true;
            if ($scope.user) {
                socket.emit('client:connect', $scope.user.id);
            }
        });

        socket.on('refresh', function () {
            $scope.logout();
        });

        socket.on('server:chat-delete', function (chat_id) {
            $scope.user.chats = $scope.user.chats.filter(function (chat) {
                if (chat_id == chat.id) {
                    return false;
                }
                return true;
            });
            if ($scope.chat != null && $scope.chat.id == chat_id) {
                $scope.chat = null;
            }
        });

        socket.on('server:chat-update', function (chat_id) {
            for( var i in $scope.user.chats ){
                if ($scope.user.chats[i].id==chat_id){
                    var saved_i = i;
                    chatFactory.getById($scope.user.chats[i].id).then(function (chat) {
                        $scope.user.chats[saved_i].ChatAvatar = chat.avatar==null ? '/image/default.jpg' : chat.avatar;
                        $scope.user.chats[saved_i].current_name = chat.name;
                        $scope.user.chats[saved_i].name = chat.name;
                    });
                }
            }

        });


        //  в верхней позиции
        $rootScope.$on('messages:scroll_top', function () {
            if ($scope.chat.is_posts_loading != false || $scope.chat.is_up_posts_loaded == true) {
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

        $rootScope.$on('scroll_down', function () {
            if ($scope.chat.is_posts_loading != false || $scope.chat.is_down_posts_loaded == true) {
                return false;
            }
            $scope.chat.getPostsDown().then(function (response) {

            });

        });

        $scope.$on('reply', function (event, post) {
            // $scope.env.selected_post = post;
            $timeout(function () {
                $rootScope.$broadcast('answer', {'smiles': $scope.env.show_smiles, 'answer': true});
            }, 10)
        });

        $scope.$on('submit', function (event, html) {
            $scope.submit(html);
        });


        $scope.$on('delete', function (event, html) {
            $scope.chat.updateLastPost();
        });


        $scope.$watch('env.edit_post', function (value) {
            if (value) {
                $scope.env.message = (value.message)
            }
        });

        $scope.$watch('upload_image', function (value) {
            if (value) {
                $scope.env.imageDialog = true;
                $scope.env.upload.image = $scope.upload_image[0]
            }
        }, true);

        $scope.$watch('env.message', function (value) {
            $rootScope.$broadcast('textField', {
                'smiles': $scope.env.show_smiles,
                'answer': $scope.env.selected_post ? true : false
            });
        });


        $scope.loadChat = function (chat, post_id) {

            chat.start_post = post_id;
            chat.CountUnreadMessages = 0;
            chat.is_down_posts_loaded = false;
            chat.is_up_posts_loaded = false;

            $scope.chat = chat;
            if (post_id != null) {
                $scope.chat.loadPosts().then(function (posts) {
                    $scope.$emit('messages:scroll_to', chat.start_post);
                    $scope.env.download = true;

                })
            } else {
                if (chat.posts.length > 0) {
                    $timeout(function () {
                        $scope.$emit('messages:scroll_down', chat.last_post_id);
                    }, 10)
                }
            }

            //if ($scope.user.history == '1') {

            $scope.$emit('open_chat', {});
            chat.hasRead();


            chat.setChatStatus($scope.user.id, $scope.env.who_is_online);
            // $scope.$emit('load_chat', {chat: chat, post_id: post_id});
        };

        $scope.cancelReply = function () {
            $scope.env.selected_post = null;
            $rootScope.$broadcast('answer', {'smiles': $scope.env.show_smiles, 'answer': false});

        };

        $scope.closeImageDialog = function () {
            $scope.env.imageDialog = false;
            $scope.env.upload = {};
        };

        $scope.addImagePost = function (model) {

            var reply = null;
            if ($scope.env.selected_post) {
                reply = $scope.env.selected_post.id;
            }
            $scope.env.adding_file = true;
            model.message = model.message == null ? model.image.filename : model.message;
            $scope.chat.addImagePost(model.image, model.message, reply).then(function (response) {
                $scope.env.adding_file = false;
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    //$scope.chat.posts.push(response.post);
                    //$scope.env.chat.LastPost = response.post;
                    //$scope.env.chat.updated_at = response.chat.updated_at;

                    $scope.closeImageDialog();
                    $scope.env.upload = {
                        image: null,
                        message: null
                    };
                    $scope.$emit('messages:scroll_down');
                }
            })
        };

        $scope.addDocumentPost = function (model) {
            var reply = null;
            if ($scope.env.selected_post) {
                reply = $scope.env.selected_post.id;
            }
            $scope.env.adding_file = true;
            model.message = model.message == null ? model.image.filename : model.message;
            $scope.chat.addDocumentPost(model.image, model.message, reply).then(function (response) {
                $scope.env.adding_file = false;

                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    $scope.closeImageDialog();
                    $scope.env.upload = {
                        image: null,
                        message: null
                    };
                    $scope.$emit('messages:scroll_down');
                }
            })
        };

        $scope.addMember = function (member) {
            $scope.model.selected_member = null;
            //$scope.env.chat.members.push(member);
            $scope.model.members = $scope.model.members.filter(function (user) {
                if (user.id != member.id) {
                    return true;
                }
                return false;
            });
            $scope.chat.addMember(member).then(function (response) {
                if (response.success == true) {
                    alertify.success('Пользователь добавлен');
                    socket.emit('client:create-chat',
                        $scope.chat.id,
                        [member.id]
                    );

                } else {
                    alertify.error(response.error);
                }
            })

        };

        $scope.closeInfoBlock = function () {
            $scope.env.show_add_info = false;
        };

        $scope.openInfoBlock = function (user) {
            $scope.env.show_add_info = true;
            $scope.env.add_info = user;

            $scope.model = angular.copy($scope.chat);
            $scope.model.members = $scope.user.contacts.filter(function (contact) {
                for (var i in $scope.chat.members) {
                    if (contact.id == $scope.chat.members[i].id) {
                        return false;
                    }
                }
                return true;
            });
        };

        $scope.changeChatAvatar = function (value) {
            $scope.chat.updateAvatar(value).then(function () {
                alertify.success('Изображение изменено');
            })
        };

        $scope.changeChatName = function (value) {
            if (value != '') {
                $scope.chat.updateName(value).then(function () {
                    alertify.success('Название изменено');

                })
            }
        };

        $scope.disableSound = function (chat, user) {
            chat.disableSound(user).then(function (response) {
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Звук выключен');
                }
            })
        };

        $scope.enableSound = function (chat, user) {
            chat.enableSound(user).then(function (response) {
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Звук включен');
                }
            })
        };

        $scope.clearChat = function (chat) {
            chat.clearChat().then(function (response) {
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Чат очищен');
                }
            })
        };

        $scope.deleteChat = function (chat) {
            var userIds = chat.getUserIds();
            for (var i in userIds) {
                if (userIds[i] == $scope.user.id) {
                    delete userIds[i]
                }
            }


            chat.deleteChat().then(function (response) {
                if (response.success == false) {
                    alertify.error(response.error);
                } else {

                    socket.emit('client:chat-delete', {
                        chat: chat.id,
                        users: userIds
                    });
                    alertify.success('Чат удален');
                    $scope.closeInfoBlock();
                    $scope.chat = undefined;
                    $scope.user.chats = $scope.user.chats.filter(function (el) {
                        if (el.id == chat.id) {
                            return false;
                        }
                        return true;
                    });

                }
            });


        };

        $scope.closeProfile = function () {
            $scope.env.show_add_info = false;
        };

        $scope.removeMember = function (user) {
            $scope.model.members.push(user)

            $scope.chat.removeMember(user.id).then(function (response) {
                if (response.success == true) {
                    alertify.success('Пользователь удален');
                    socket.emit('client:chat-delete', {
                        chat: $scope.chat.id,
                        users: [user.id]
                    });
                } else {
                    alertify.error(response.error);
                }
            })
        };

        $scope.smilesDialog = function () {
            $scope.env.show_smiles = !$scope.env.show_smiles;
            $timeout(function () {
                $rootScope.$broadcast('smiles', {
                    'smiles': $scope.env.show_smiles,
                    'answer': $scope.env.selected_post ? true : false
                });

            }, 10)
        };

        $scope.setSmile = function (text) {
            $rootScope.$broadcast('insert_smiles', text);
        };

        $scope.submit = function (message) {
            if (message == '') {
                return;
            }
            if ($scope.env.edit_post) {
                $scope.env.edit_post.update(message).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        for (var i in $scope.chat.posts) {
                            if ($scope.chat.posts[i].id == response.post.id) {
                                $scope.chat.posts[i].message = response.post.message;
                            }
                        }
                        // $scope.env.chat.posts.push(response.post);
                        $scope.env.edit_post = null;
                        alertify.success('Сообщение изменено');
                        $scope.$emit('submit_msg');
                    }
                })
            } else {
                var reply = null;
                if ($scope.env.selected_post) {
                    reply = $scope.env.selected_post.id;
                }

                $scope.chat.addPost(message, reply, $scope.chat.getUser($scope.user)).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        $scope.env.selected_post = null;
                        $scope.$emit('messages:scroll_down');
                    }
                })
            }

            $scope.env.message = '';
            $rootScope.$broadcast('answer', {'smiles': $scope.env.show_smiles, 'answer': false});
            $scope.env.selected_post = null;
            $timeout(function () {
                $rootScope.$broadcast('textField', {
                    'smiles': $scope.env.show_smiles,
                    'answer': $scope.env.selected_post ? true : false
                });
                //$('#textarea').focus();;
                $scope.$emit('submit_msg');

            }, 10)

        };


        $(window).resize(function () {
            $rootScope.$broadcast('textField', {
                'smiles': $scope.env.show_smiles,
                'answer': $scope.env.selected_post ? true : false
            });
        });


    }
})();

