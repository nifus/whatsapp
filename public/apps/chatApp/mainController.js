(function () {
    'use strict';
    angular.module('chatApp').controller('mainController', mainController);

    mainController.$inject = ['$scope', '$q', 'userFactory', '$state', 'chatFactory', 'configFactory', 'socket', '$rootScope', '$auth', '$cookies', '$filter'];

    function mainController($scope, $q, userFactory, $state, chatFactory, configFactory, socket, $rootScope, $auth, $cookies, $filter) {



        $scope.config = null;
        $scope.user = null;

        $scope.promises = [];
        $scope.initPromises = [];
        $scope.loaded = false;

        $scope.init = [];
        $scope.counter = 0;
        $scope.user_off = false;


        /*socket.on('server:signin', function (user_id) {
            if ($scope.user!=null){
                if (user_id == $scope.user.id) {
                    window.location.href='/'
                }
            }
        });*/



        window.onblur = function () {
            $scope.user_off = true;
        };

        window.onfocus = function () {
            $scope.user_off = false;
            if ($scope.chat) {
                $scope.chat.hasRead();
            }
        };

        var configPromise = configFactory.get().then(function (response) {
            $scope.config = response;
        });
        $scope.promises.push(configPromise);

        var userPromise = userFactory.getAuthUser().then(function (user) {
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
                    for (var i in user.chats) {
                        user.chats[i].posts = $filter('orderBy')(user.chats[i].posts, 'id');
                        user.chats[i].setLastPost(user.chats[i].posts[user.chats[i].posts.length - 1])
                    }
                });
            } else {
                chatFactory.getByUser(user.id).then(function (chats) {
                    user.chats = chats;
                    for (var i in user.chats) {
                        user.chats[i].posts = [];
                        user.chats[i].setLastPost(null);
                        user.chats[i].CountUnreadMessages = 0;
                    }
                });
            }
        });
        $scope.promises.push(userPromise);


        $q.all($scope.promises).then(function () {
            $scope.loaded = true;
            execute();
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
            userFactory.logout();
        }
    }
})();