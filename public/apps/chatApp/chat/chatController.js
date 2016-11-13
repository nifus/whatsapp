(function () {
    'use strict';
    angular.module('chatApp').controller('chatController', chatController);

    chatController.$inject = ['$scope', '$timeout', '$rootScope', 'socket','ngAudio','chatFactory'];

    function chatController($scope, $timeout, $rootScope, socket, ngAudio,chatFactory) {

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
            first_post_id: null,
            show_smiles: false,
            download: false,
            connected: true,
            sound: ngAudio.load("audio/im.mp3"),
            who_is_online:[]
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

        socket.on('who_is_online', function (users) {
            var online = []
            for( var i in users ){
                online.push( users[i].user );
            }
            $scope.env.who_is_online = online;
            if ($scope.chat != null) {
                $scope.chat.setChatStatus($scope.user.id, $scope.env.who_is_online);
            }
        });

        socket.on('server:create-chat', function (chat) {
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

        socket.on('server:chat-delete', function (chat_id) {

            $scope.user.chats = $scope.user.chats.filter(function (chat) {
                if (chat_id == chat.id) {
                    return false;
                }
                return true;
            });
            if ($scope.chat!=null && $scope.chat.id == chat_id) {
                $scope.chat = null;
            }
        })


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

        $rootScope.$on('scroll_down', function () {
            // console.log('event: scroll_down')
            if ($scope.env.loading == false && $scope.env.download == true) {
                //   console.log('loading down')
                $scope.env.loading = true;

                //$scope.env.start +=30;
                $scope.env.chat.getPostsDown($scope.env.first_post_id).then(function (response) {

                    for (var i in response) {
                        $scope.env.chat.posts.push(response[i])
                    }
                    if (response.length > 0) {
                        $('div.messages').scrollTop(document.getElementById('post-' + $scope.env.first_post_id).offsetTop);
                        $scope.env.first_post_id = response[response.length - 1].id;
                    }
                    $scope.env.loading = false;
                });
            }
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
                    // $scope.chat.posts.push( new postService(response.post) );

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
            $scope.chat.updateAvatar(value)
        }

        $scope.changeChatName = function (value) {
            if (value != '') {
                $scope.chat.updateName(value)
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
                    //$scope.chat.posts.push( new postService(response.post) )
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

