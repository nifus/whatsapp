(function (angular, window) {
    'use strict';
    angular.module('core').service('chatService', chatService);
    chatService.$inject = ['postFactory','$http'];

    function chatService( postFactory, $http) {
        return function (data) {
            var Object = data;
            Object.waiting = false;

            Object.getPosts = function(){
                return postFactory.getPosts(Object.id)
            };

            Object.addPost = function(message){
                return postFactory.addPost(message, Object.id);
            };

            Object.addPost = function(message){
                return postFactory.addPost(message, Object.id);
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

