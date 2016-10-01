(function () {
    'use strict';
    angular.module('chatApp').controller('chatController', chatController);

    chatController.$inject = ['$scope',  'hotkeys','postService','$timeout','$rootScope'];

    function chatController($scope, hotkeys, postService,$timeout, $rootScope) {

        $scope.more = false;
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
            },
            selected_post:null,
            edit_post: null,
            loading:false,
            start: 0,
            first_post_id: null,
            show_smiles: false
        };
        function initPage(deferred) {
            $scope.user = $scope.$parent.env.user;
            return deferred.promise;
        }

        // initPage();
        $scope.$parent.init.push(initPage);

        $scope.cancelReply = function(){
            $scope.env.selected_post = null;
        };

        $scope.$watch('env.loading', function(value){
            if ( value==true ){
                $scope.env.start +=30;
                $scope.env.chat.getPosts($scope.env.start).then(function (response) {
                    for( var i in response ){
                        $scope.env.chat.posts.unshift(response[i])
                    }
                    if (response.length>0){
                        $('div.messages').scrollTop( document.getElementById('post-'+$scope.env.first_post_id).offsetTop );
                        $scope.env.first_post_id = response[0].id;
                    }
                    $scope.env.loading = false;
                });
            }
        });

        $scope.closeImageDialog = function(){
            $scope.env.imageDialog = false;
            $scope.env.upload = {};
        };


        $scope.addImagePost = function(model){
            var reply = null;
            if ( $scope.env.selected_post ){
                reply = $scope.env.selected_post.id;
            }
            $scope.env.chat.addImagePost(model.image, model.message, reply).then(function (response) {
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    $scope.env.chat.posts.push(response.post);
                    $scope.env.chat.LastPost = response.post;
                    $scope.env.chat.updated_at = response.chat.updated_at;

                    $scope.closeImageDialog();
                    $scope.env.upload = {
                        image: null,
                        message:null
                    };
                    $timeout(function(){
                        $('div.messages').scrollTop( document.getElementById('post-'+response.post.id).offsetTop );
                    },10)
                }
            })
        };

        $scope.addDocumentPost = function(model){
            var reply = null;
            if ( $scope.env.selected_post ){
                reply = $scope.env.selected_post.id;
            }
            $scope.env.chat.addDocumentPost(model.image, model.message, reply).then(function (response) {
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    $scope.env.chat.posts.push(response.post);
                    $scope.env.chat.LastPost = response.post;
                    $scope.env.chat.updated_at = response.chat.updated_at;
                    $scope.closeImageDialog();
                    $scope.env.upload = {
                        image: null,
                        message:null
                    };
                    $timeout(function(){
                        $('div.messages').scrollTop( document.getElementById('post-'+response.post.id).offsetTop );
                    },100)
                }
            })
        };

        $scope.$watch('env.edit_post', function(value){
            if ( value ){
                $scope.env.message = value.message
            }
        });

        $scope.$watch('upload_image', function(value){
            if ( value ){
                $scope.env.imageDialog = true;
                $scope.env.upload.image = $scope.upload_image[0]
            }
        },true);

        $scope.$watch('env.chat', function (chat) {
            if (!chat) {
                return;
            }

            if (  $scope.user.history=='1' ){
                chat.getPosts().then(function (response) {
                    chat.posts = response;
                    if (chat.posts.length>0){
                        $scope.env.first_post_id = chat.posts[0].id;
                        $timeout(function(){
                            $('div.messages').scrollTop( document.getElementById('post-'+$scope.env.first_post_id).offsetTop );

                        },100)

                    }
                });
            }else{
                chat.posts = [];
                chat.LastPost = null
            }


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
                    $scope.env.chat.posts.push( new postService(response.post) );

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
                    $scope.env.chat.posts.push( new postService(response.post) )
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
                $timeout(function(){
                    $scope.env.message = null;
                },100);

                if ( $scope.env.edit_post ){
                    $scope.env.edit_post.update(message).then(function (response) {
                        if (response.success == false) {
                            alertify.error(response.error);
                        } else {
                            for( var i in $scope.env.chat.posts){
                                if ( $scope.env.chat.posts[i].id==response.post.id ){
                                    $scope.env.chat.posts[i].message = response.post.message;
                                }
                            }
                           // $scope.env.chat.posts.push(response.post);
                            $scope.env.edit_post = null;
                            alertify.success('Сообщение изменено')
                        }
                    })
                }else{
                    var reply = null;
                    if ( $scope.env.selected_post ){
                        reply = $scope.env.selected_post.id;
                    }
                    $scope.env.chat.addPost(message, reply).then(function (response) {
                        if (response.success == false) {
                            alertify.error(response.error);
                        } else {
                            $scope.env.chat.posts.push(response.post);
                            $scope.env.chat.LastPost = response.post;
                            $scope.env.chat.updated_at = response.chat.updated_at;

                            $scope.env.selected_post = null;
                            $timeout(function(){
                                $('div.messages').scrollTop( document.getElementById('post-'+response.post.id).offsetTop );
                            },100)
                        }
                    })
                }

            },
            allowIn: ['textarea']
        });

        $scope.smilesDialog = function(){
            $scope.env.show_smiles = !$scope.env.show_smiles;
            $timeout(function(){
                $rootScope.$broadcast('smiles',{'smiles':$scope.env.show_smiles} );

            },10)
        };

        $scope.$watch('msg', function(value){
            $rootScope.$broadcast('textField',{'smiles':$scope.env.show_smiles});
        });
        $scope.$on('submit', function(event, html){
           // $scope.env.messageconsole.log(html)
            var message =html;
            $timeout(function(){
                $scope.env.message = null;
            },100);

            if ( $scope.env.edit_post ){
                $scope.env.edit_post.update(message).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        for( var i in $scope.env.chat.posts){
                            if ( $scope.env.chat.posts[i].id==response.post.id ){
                                $scope.env.chat.posts[i].message = response.post.message;
                            }
                        }
                        // $scope.env.chat.posts.push(response.post);
                        $scope.env.edit_post = null;
                        alertify.success('Сообщение изменено')
                    }
                })
            }else{
                var reply = null;
                if ( $scope.env.selected_post ){
                    reply = $scope.env.selected_post.id;
                }
                $scope.env.chat.addPost(message, reply).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        $scope.env.chat.posts.push(response.post);
                        $scope.env.chat.LastPost = response.post;
                        $scope.env.chat.updated_at = response.chat.updated_at;

                        $scope.env.selected_post = null;
                        $timeout(function(){
                            $('div.messages').scrollTop( document.getElementById('post-'+response.post.id).offsetTop );
                        },100)
                    }
                })
            }

        });
        $scope.setSmile = function(text){
            $rootScope.$broadcast('insert_smiles',text);
        }


    }
})();

