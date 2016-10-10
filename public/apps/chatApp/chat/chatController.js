(function () {
    'use strict';
    angular.module('chatApp').controller('chatController', chatController);

    chatController.$inject = ['$scope','postService','$timeout','$rootScope','$filter'];

    function chatController($scope, postService,$timeout, $rootScope,$filter) {

        $scope.more = false;
        $scope.env = {
            agents: [],

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
            show_smiles: false,
            download: false
        };


        $scope.config = {
            autoHideScrollbar: false,
            theme: 'light',
            advanced:{
                updateOnContentResize: true
            },
            position: "bottom",
            scrollInertia: 0
        };

        function initPage(deferred) {
            $scope.user = $scope.$parent.env.user;
            $scope.config = $scope.$parent.env.config;
            //$scope.env.chat = $scope.$parent.env.chat;
            return deferred.promise;
        }

        // initPage();
        $scope.$parent.init.push(initPage);

        $scope.cancelReply = function(){
            $scope.env.selected_post = null;
            $rootScope.$broadcast('answer',{'smiles':$scope.env.show_smiles,'answer': false});

        };



        $rootScope.$on('scroll_down', function(){
           // console.log('event: scroll_down')
            if ($scope.env.loading == false && $scope.env.download==true ){
             //   console.log('loading down')
                $scope.env.loading = true;

                //$scope.env.start +=30;
                $scope.env.chat.getPostsDown($scope.env.first_post_id).then(function (response) {

                    for( var i in response ){
                        $scope.env.chat.posts.push(response[i])
                    }
                    if (response.length>0){
                        $('div.messages').scrollTop( document.getElementById('post-'+$scope.env.first_post_id).offsetTop );
                        $scope.env.first_post_id = response[response.length-1].id;
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
                    $scope.env.chat.setLastPost(response.post);
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
                $scope.env.message = (value.message)
            }
        });

        $scope.$watch('upload_image', function(value){
            if ( value ){
                $scope.env.imageDialog = true;
                $scope.env.upload.image = $scope.upload_image[0]
            }
        },true);

        /* $scope.$watch('chat', function (value) {
            console.log(value)
            if (!chat) {
                return;
            }
            if (  $scope.user.history=='1' ){
                var promise = chat.start_post ?  chat.getPostsAroundId(chat.start_post) : chat.getPosts();
                promise.then(function (response) {
                    response = $filter('orderBy')(response,'id');
                    chat.posts = response;
                    if (chat.posts.length>0){
                        $scope.env.first_post_id = chat.posts[ chat.posts.length-1 ].id;

                        $timeout(function(){
                            if (chat.start_post ){
                                $scope.env.download = true;
                                $('div.messages').scrollTop( document.getElementById('post-'+chat.start_post).offsetTop );
                            }else{
                                $('div.messages').scrollTop( document.getElementById('post-'+$scope.env.first_post_id).offsetTop );
                            }
                        },100)

                    }
                });
            }else{
                chat.posts = [];
                $scope.env.chat.setLastPost(null);

            }
            chat.getChatStatus($scope.user.id);
        });*/

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



        $scope.smilesDialog = function(){
            $scope.env.show_smiles = !$scope.env.show_smiles;
            $timeout(function(){
                $rootScope.$broadcast('smiles',{'smiles':$scope.env.show_smiles,'answer': $scope.env.selected_post ? true : false} );

            },10)
        };

        $scope.$watch('env.message', function(value){
            $rootScope.$broadcast('textField',{'smiles':$scope.env.show_smiles,'answer': $scope.env.selected_post ? true : false});
        });


        $scope.$on('reply', function(event, post){
           // $scope.env.selected_post = post;
            $timeout(function(){
                $rootScope.$broadcast('answer',{'smiles':$scope.env.show_smiles,'answer': true});
            },10)
        });

        $scope.$on('submit', function(event, html){

            $scope.submit(html)
        });

        $scope.setSmile = function(text){
            $rootScope.$broadcast('insert_smiles',text);
        };

        $scope.submit = function(message){


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
                $scope.chat.addPost(message, reply).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        $scope.env.selected_post = null;

                        $scope.$emit('messages:scroll_down');
                        //$timeout(function(){
                       //     $('div.messages').scrollTop( document.getElementById('post-'+response.post.id).offsetTop );
                        //},100)
                    }
                })
            }

            $scope.env.message = '';
            $rootScope.$broadcast('answer',{'smiles':$scope.env.show_smiles,'answer': false});
            $scope.env.selected_post = null
        };

        $scope.$on('delete', function(event, html){
            var count = $scope.env.chat.posts.length;
            $scope.env.chat.setLastPost(null);

            for(var i=count-1;i>=0;i--){
                if ( $scope.env.chat.posts[i].is_deleted=='0' ){
                    $scope.env.chat.LastPost =$scope.env.chat.posts[i];
                    break;
                }
            }
        });
    }
})();

