(function (angular, window) {
    'use strict';
    angular.module('core').service('chatService', chatService);
    chatService.$inject = ['postFactory', '$http', 'userFactory', '$filter', '$q', 'socket','postService'];

    function chatService(postFactory, $http, userFactory, $filter, $q, socket, postService) {
        return function (data, user_id) {
            var Object = angular.copy(data);
            Object.waiting = false;
            Object.start_post = null;   // номер POST ID который должен открываться при загрузке чата
            Object.first_post_id = null;    //  номер первого ID
            Object.last_post_id = null;    //  номер последнего ID
            Object.is_posts_loading = false; // флаг подгрузки сообщений в чат
            Object.is_posts_loaded = false; // все сообщения загружены в чат
            Object.posts_start = data.posts==undefined ? 0 : data.posts.length; // точка на которой закончились грузиться сообщения
            //Object.last_read_date = null; // время когда этот чат читали последний раз
            Object.posts = [];

            if ( data.posts!=undefined && data.posts.length>0 ){
                for(var i in data.posts){
                    Object.posts.push( new postService(data.posts[i]) )
                }
            }else{
                Object.posts = [];
            }
            Object.current_user_id = user_id;



            Object.needPlayMusic = function (user_id) {
                for (var i in Object.members) {
                    if (Object.members[i].id == user_id && Object.members[i].pivot.sound == 1) {
                        return true;
                    }
                }
                return false;
            };

            Object.readChat = function(){
                for( var i in Object.posts ){
                    Object.posts[i].is_read = 1;
                }
            };

            Object.hasRead = function(user){
                var user_to = null;
                if (Object.is_group==0 && user!=undefined && user.id!=undefined){
                    user_to = user.id
                }
                return $http.put('/chats/' + Object.id + '/read').then(function () {
                    socket.emit('client:read_chat',{user_to:user_to, chat_id: Object.id});
                })
            };

            Object.updateInformation = function (is_current_chat, post_id) {
                return $http.get('/chats/' + Object.id + '/status/'+post_id).then(function (response) {
                    if (response.data.success == true) {
                        var post =  new postService(response.data.LastPost);
                        Object.setLastPost(post);
                        Object.updated_at = response.data.updated_at;
                        Object.CountUnreadMessages = true===is_current_chat ? 0 :response.data.CountUnreadMessages;
                        if (Object.posts) {
                            Object.posts.push(post)
                        }
                    }
                    //if( true===is_current_chat ){

                    //    Object.hasRead();
                   // }

                    return response.data;
                })
            };

            Object.setLastPost = function (last_post) {
                Object.LastPost = last_post;
                if (last_post != null) {
                    var message = last_post.message.replace(/<[^>]+>/gm, '');
                    Object.LastPost.cut_message = $filter('limitTo')(message, 50);
                    Object.last_post_id = last_post.id;

                }
            };
            Object.setLastPost(data.LastPost);

            Object.findLastPost = function(){
                var length = Object.posts.length;
                for( var i=length-1;i>0;i--){
                    if ( Object.posts[i].is_deleted!='1' ){
                        return Object.posts[i];
                    }
                }
                return null;
            };

            Object.updateLastPost = function(){
                var post = Object.findLastPost();
                Object.setLastPost(post)
                //console.log(Object.posts);
            };

            Object.addMember = function (user) {
                return $http.post('/chats/' + Object.id + '/' + user.id).then(function (response) {
                    if (response.data.success == true) {
                        user.pivot = {
                            is_admin: "0",
                            sound: "1"
                        };
                        Object.members.push(user)
                    }
                    return response.data;
                })
            };

            Object.removeMember = function (user_id) {
                return $http.delete('/chats/' + Object.id + '/' + user_id).then(function (response) {
                    if (response.data.success == true) {
                        Object.members = Object.members.filter(function (member) {
                            if (member.id == user_id) {
                                return false;
                            }
                            return true;
                        });
                    }
                    return response.data;
                })
            };

            Object.isAdmin = function (user_id) {
                for (var i in Object.members) {
                    if (Object.members[i].id == user_id && Object.members[i].pivot.is_admin == "1") {
                        return true;
                    }
                }
                return false;
            };


            Object.getChatLogin = function (user_id) {
                if (Object.is_group == 1) {
                    return null;
                }
                var users = Object.members.filter(function (user) {
                    if (user.id != user_id) {
                        return true;
                    }
                    return false;
                });

                if (users.length == 1) {
                    return users[0].login;
                }
            };

            Object.getChatName = function (user_id) {
                if (Object.name != '') {
                    return Object.name;
                }
                var users = Object.members.filter(function (user) {
                    if (user.id != user_id) {
                        return true;
                    }
                    return false;
                });

                if (users.length == 1) {
                    return users[0].name;
                } else if (users.length > 1) {
                    var names = [];
                    for (var i in users) {
                        names.push(users[i].name);
                    }
                    return names.join(', ');
                }
            };
            Object.current_name = Object.name=='' ? Object.getChatName(user_id) :Object.name ;


            Object.getChatAvatar = function (user_id) {
                //console.log(Object.avatar)
                if (Object.avatar != '') {
                    return Object.avatar;
                }

                var users = Object.members.filter(function (user) {
                    if (user.id != user_id) {
                        return true;
                    }
                    return false;
                });
                if (users.length == 1) {
                    return users[0].AvatarSrc;
                } else if (users.length > 1) {

                    return '/image/default_chat.jpg';
                }
            };

            Object.setChatStatus = function (user_id, who_is_online) {

                Object.status = Object.is_group == 1 ? 'Информация о группе' : 'Информация о пользователе';

                if (Object.is_group == 0) {
                    var users = Object.members.filter(function (user) {
                        if (user.id != user_id) {
                            return true;
                        }
                        return false;
                    });

                    if (users.length == 1) {
                        for( var i in who_is_online){
                            if (who_is_online[i].user==users[0].id){
                                Object.status = 'online';
                                break;
                            }
                        }

                        if ( Object.status!='online' ){
                            userFactory.getLastActionDate(users[0].id).then(function (response) {
                                Object.status = response.data.last_active;
                            })
                        }


                    }
                } else {
                    var names = [];
                    for (var i in  Object.members) {
                        if (Object.members[i].id == user_id) {
                            names.push('Вы')
                        } else {
                            names.push(Object.members[i].name);
                        }
                    }
                    Object.status = names.join(', ');
                }
            };

            Object.getUser = function (user_id) {

                var users = Object.members.filter(function (user) {
                    if (user.id != user_id) {
                        return true;
                    }
                    return false;
                });
                if (users.length == 1) {
                    return users[0];
                }
            };

            Object.loadPosts = function () {
                var defer = $q.defer();
                var promise = Object.start_post ? Object.getPostsAroundId(Object.start_post) : Object.getFirstPosts();
                promise.then(function (response) {
                    var length = Object.posts.length;
                    Object.first_post_id = length > 0 ? Object.posts[Object.posts.length - 1].id : null;
                    Object.last_post_id = length > 0 ? Object.posts[Object.posts.length - 1].id : null;
                    Object.is_posts_loaded = length < 30 ? true : false;
                    defer.resolve(response);
                });
                return defer.promise
            };


            Object.getFirstPosts = function () {
                Object.is_posts_loading = true;
                Object.posts_start = 0;
                var defer = $q.defer();
                postFactory.getPosts(Object.id, Object.posts_start).then(function (response) {
                    Object.is_posts_loaded = response.length < 30 ? true : false;
                    Object.posts = $filter('orderBy')(response, 'id');
                    Object.is_posts_loading = false;
                    defer.resolve(response);
                });
                return defer.promise
            };

            Object.getUpPosts = function () {
                Object.is_posts_loading = true;
                Object.posts_start += 30;
                var defer = $q.defer();
                postFactory.getPosts(Object.id, Object.posts_start).then(function (response) {
                    Object.is_posts_loaded = response.length < 30 ? true : false;
                    for (var i in response) {
                        Object.posts.unshift(response[i])
                    }
                    Object.is_posts_loading = false;
                    defer.resolve(response);
                });
                return defer.promise
            };
            Object.getPostsAroundId = function (post_id) {
                return postFactory.getPostsAroundId(Object.id, post_id)
            };
            Object.getPostsDown = function (post_id) {
                return postFactory.getPostsDown(Object.id, post_id)
            };

            Object.addPost = function (message, reply, user) {
                var defer = $q.defer();
                var user_to = null;
                if (Object.is_group==0 && user!=undefined && user.id!=undefined){
                    user_to = user.id
                }
                postFactory.addPost(message, reply, Object.id, user_to).then(function (response) {
                    Object.posts.push(response.post);
                    Object.setLastPost(response.post);
                    Object.updated_at = response.chat.updated_at;
                    defer.resolve(response);
                });
                return defer.promise
            };


            Object.addImagePost = function (image, message, reply) {
                var defer = $q.defer();
                 postFactory.addImagePost(image, message, reply, Object.id).then(function (response) {
                     Object.posts.push(response.post);
                     Object.setLastPost(response.post);
                     Object.updated_at = response.chat.updated_at;
                     defer.resolve(response);
                 });
                return defer.promise
            };

            Object.addDocumentPost = function (document, message, reply) {
                var defer = $q.defer();
                 postFactory.addDocumentPost(document, message, reply, Object.id).then(function (response) {
                    Object.posts.push(response.post);
                    Object.setLastPost(response.post);
                    Object.updated_at = response.chat.updated_at;
                    defer.resolve(response);
                });
                return defer.promise
            };

            Object.clearChat = function () {
                return $http.post('/chats/' + Object.id + '/clear', {}).then(function (response) {
                    if (response.data.success == true) {
                        Object.posts = [];
                    }
                    return response.data;
                })
            };

            Object.deleteChat = function () {
                return $http.delete('/chats/' + Object.id + '').then(function (response) {
                    return response.data;
                })
            };
            Object.enableSound = function (user_id) {
                return $http.post('/chats/' + Object.id + '/sound', {
                    user_id: user_id,
                    'enable': 1
                }).then(function (response) {
                    if (response.data.success == true) {
                        var member = Object.members.filter(function (member) {
                            if (member.id == user_id) {
                                return true;
                            }
                            return false;
                        })[0];
                        member.pivot.sound = 1
                    }
                    return response.data;
                })
            };
            Object.disableSound = function (user_id) {
                return $http.post('/chats/' + Object.id + '/sound', {
                    user_id: user_id,
                    'enable': 0
                }).then(function (response) {
                    if (response.data.success == true) {
                        var member = Object.members.filter(function (member) {
                            if (member.id == user_id) {
                                return true;
                            }
                            return false;
                        })[0];
                        member.pivot.sound = 0
                    }
                    return response.data;
                })
            };

            Object.IsEnabledSound = function (user_id) {
                var member = Object.members.filter(function (member) {
                    if (member.id == user_id) {
                        return true;
                    }
                    return false;
                })[0];
                if (member.pivot.sound == 1) {
                    return true;
                }
                return false;
            };
            Object.IsDisabledSound = function (user_id) {
                var member = Object.members.filter(function (member) {
                    if (member.id == user_id) {
                        return true;
                    }
                    return false;
                })[0];
                if (member.pivot.sound == 0) {
                    return true;
                }
                return false;
            };

            Object.updateName = function (name) {
                return $http.put('/chats/' + Object.id, {name: name}).then(function (response) {
                    if (response.data.success == true) {
                        Object.name = name;
                    }
                    return response.data;
                })
            };
            Object.updateAvatar = function (value) {
                return $http.put('/chats/' + Object.id, {avatar: value}).then(function (response) {
                    if (response.data.success == true) {
                        Object.avatar = response.data.chat.AvatarSrc;
                        Object.AvatarSrc = response.data.chat.AvatarSrc;
                    }
                    return response.data;
                })
            };

            Object.getUserIds = function(){
                var result = [];
                for( var i in Object.members ){
                    result.push( Object.members[i].id )
                }
                return result;
            }
            return Object;
        };


    }
})(angular, window);

