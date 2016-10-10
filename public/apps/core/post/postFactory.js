(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('postFactory', postFactory);
    postFactory.$inject = ['postService', '$http', 'socket'];

    function postFactory(postService, $http, socket) {

        return {
            getPosts: getPosts,
            getPostsAroundId: getPostsAroundId,
            getPostsDown: getPostsDown,
            addPost: addPost,
            addImagePost: addImagePost,
            addDocumentPost: addDocumentPost
        };

        function addPost(message, reply_to, chat_id) {
            return $http.post('/chats/' + chat_id + '/add-post', {
                message: message,
                type: 'text',
                reply_to: reply_to
            }).then(function (response) {
                if (response.data.success == true) {
                    socket.emit('message', {chat_id: chat_id, post_id: response.data.post.id});
                    return {
                        success: response.data.success,
                        post: new postService(response.data.post),
                        chat: response.data.chat
                    };
                } else {
                    return {success: response.data.success, error: response.data.error};
                }
            })
        }

        function addImagePost(image, message, reply_to, chat_id) {
            return $http.post('/chats/' + chat_id + '/add-post', {
                message: message,
                image: image,
                reply_to: reply_to,
                type: 'image'
            }).then(function (response) {
                if (response.data.success == true) {
                    socket.emit('message', {chat_id: chat_id, post_id: response.data.post.id});
                    return {
                        success: response.data.success,
                        post: new postService(response.data.post),
                        chat: response.data.chat
                    };
                } else {
                    return {success: response.data.success, error: response.data.error};
                }
            })
        }

        function addDocumentPost(document, message, reply_to, chat_id) {
            return $http.post('/chats/' + chat_id + '/add-post', {
                message: message,
                document: document,
                reply_to: reply_to,
                type: 'document'
            }).then(function (response) {
                socket.emit('message', {chat_id: chat_id, post_id: response.data.post.id});
                if (response.data.success == true) {
                    return {
                        success: response.data.success,
                        post: new postService(response.data.post),
                        chat: response.data.chat
                    };
                } else {
                    return {success: response.data.success, error: response.data.error};
                }
            })
        }

        function getPosts(id, start) {
            if (start == undefined) {
                start = 0
            }
            return $http.post('/chats/' + id, {start: start, count: 30}).then(function (response) {
                var result = [];
                for (var i in response.data.posts) {
                    result.push(new postService(response.data.posts[i]));
                }
                return result;
            })
        }

        function getPostsAroundId(id, post_id) {
            return $http.post('/chats/' + id + '/around/' + post_id, {count: 30}).then(function (response) {
                var result = [];
                for (var i in response.data.posts) {
                    result.push(new postService(response.data.posts[i]));
                }
                return result;
            })
        }

        function getPostsDown(id, post_id) {
            return $http.post('/chats/' + id + '/down/' + post_id, {count: 30}).then(function (response) {
                var result = [];
                for (var i in response.data.posts) {
                    result.push(new postService(response.data.posts[i]));
                }
                return result;
            })
        }


    }


})(angular, window);



