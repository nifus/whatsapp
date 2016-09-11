(function (angular, window) {
    'use strict';
    angular.module('core').service('chatService', chatService);
    chatService.$inject = ['postFactory', '$http', 'userFactory'];

    function chatService(postFactory, $http, userFactory) {
        return function (data) {
            var Object = data;
            Object.waiting = false;

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

            Object.getChatAvatar = function (user_id) {
                if (Object.avatar != '') {
                    return Object.AvatarSrc;
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

            Object.getChatStatus = function (user_id) {
                Object.status = Object.is_group == 1 ? 'Информация о группе' : 'Информация о пользователе';

                if (Object.is_group == 0) {
                    var users = Object.members.filter(function (user) {
                        if (user.id != user_id) {
                            return true;
                        }
                        return false;
                    });

                    if (users.length == 1) {
                        userFactory.getStatus(users[0].id).then(function (response) {
                            if (response.data.online === true) {
                                Object.status = 'online'
                            } else {
                                Object.status = 'был(-а): суббота в 08:35';
                            }
                        })
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

            Object.getPosts = function () {
                return postFactory.getPosts(Object.id)
            };

            Object.addPost = function (message, reply) {
                return postFactory.addPost(message, reply, Object.id);
            };


            Object.addImagePost = function (image, message, reply) {
                return postFactory.addImagePost(image, message, reply, Object.id);
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
            return Object;
        };


    }
})(angular, window);

