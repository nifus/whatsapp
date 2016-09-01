(function (angular, window) {
    'use strict';
    angular.module('core').service('chatService', chatService);
    chatService.$inject = ['postFactory','$http'];

    function chatService( postFactory, $http) {
        return function (data) {
            var Object = data;
            Object.waiting = false;

            Object.getChatName = function(user_id){
                if ( Object.name!='' ){
                    return Object.name;
                }
                var users = Object.members.filter( function(user){
                    if (user.id!=user_id){
                        return true;
                    }
                    return false;
                });

                if ( users.length==1 ){
                    return users[0].name;
                }else if( users.length>1 ){
                    var names = [];
                    for( var i in users ){
                        names.push( users[i].name );
                    }
                    return names.join(', ');
                }
            };

            Object.getChatAvatar = function(user_id){
                if ( Object.avatar!='' ){
                    return Object.AvatarSrc;
                }
                var users = Object.members.filter( function(user){
                    if (user.id!=user_id){
                        return true;
                    }
                    return false;
                });
                if ( users.length==1 ){
                    return users[0].AvatarSrc;
                }else if( users.length>1 ){

                    return '/image/default_chat.jpg';
                }
            };

            Object.getUser = function(user_id){

                var users = Object.members.filter( function(user){
                    if (user.id!=user_id){
                        return true;
                    }
                    return false;
                });
                if ( users.length==1 ){
                    return users[0];
                }
            };

            Object.getPosts = function(){
                return postFactory.getPosts(Object.id)
            };

            Object.addPost = function(message){
                return postFactory.addPost(message, Object.id);
            };

            Object.addPost = function(message){
                return postFactory.addPost(message, Object.id);
            };

            Object.clearChat = function(){
                return $http.post( '/chats/'+Object.id+'/clear',{}).then(function (response) {
                    if (response.data.success==true){
                        Object.posts = [];
                    }
                    return response.data;
                })
            };

            Object.deleteChat = function(){
                return $http.delete( '/chats/'+Object.id+'').then(function (response) {
                    return response.data;
                })
            };
            Object.enableSound = function(user_id){
                return $http.post( '/chats/'+Object.id+'/sound',{ user_id: user_id,'enable': 1}).then(function (response) {
                    if (response.data.success==true){
                        var member = Object.members.filter(function (member) {
                            if(member.id==user_id){
                                return true;
                            }
                            return false;
                        })[0];
                        member.pivot.sound=1
                    }
                    return response.data;
                })
            };
            Object.disableSound = function(user_id){
                return $http.post( '/chats/'+Object.id+'/sound',{ user_id: user_id,'enable': 0}).then(function (response) {
                    if (response.data.success==true){
                        var member = Object.members.filter(function (member) {
                            if(member.id==user_id){
                                return true;
                            }
                            return false;
                        })[0];
                        member.pivot.sound=0
                    }
                    return response.data;
                })
            };

            Object.IsEnabledSound = function(user_id){
                var member = Object.members.filter(function (member) {
                    if(member.id==user_id){
                        return true;
                    }
                    return false;
                })[0];
                if ( member.pivot.sound==1 ){
                    return true;
                }
                return false;
            };
            Object.IsDisabledSound = function(user_id){
                var member = Object.members.filter(function (member) {
                    if(member.id==user_id){
                        return true;
                    }
                    return false;
                })[0];
                if ( member.pivot.sound==0 ){
                    return true;
                }
                return false;
            };
            return Object;
        };


    }
})(angular, window);

