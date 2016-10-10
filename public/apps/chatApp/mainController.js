(function () {
    'use strict';
    angular.module('chatApp').controller('mainController', mainController);

    mainController.$inject = ['$scope', '$q', 'userFactory', '$state', 'chatFactory', 'configFactory', 'socket', 'ngAudio'];

    function mainController($scope, $q, userFactory, $state, chatFactory, configFactory, socket, ngAudio) {
        $scope.env = {
            config: [],
            user: null,
            currency: []
        };

        $scope.promises = [];
        $scope.initPromises = [];
        $scope.loaded = false;
        $scope.init = [];
        $scope.counter = 0;
        $scope.sound = ngAudio.load("audio/im.mp3");


        socket.on('reload', function (obj) {
            console.log(obj);
            var chat_id = obj.chat_id;
            $scope.env.user.chats.filter(function (chat) {
                if (chat.id == chat_id) {
                    chat.updateInformation();
                    if (chat.needPlayMusic($scope.env.user.id)) {
                        $scope.sound.play();
                    }
                }
            })
        });

        socket.on('create_chat', function (response) {
            console.log('new chat');
            console.log(response);
            for( var i in response.users){
                if ( response.users[i] == $scope.env.user.id ){
                    chatFactory.getById(response.chat).then(function(chat){
                        console.log(chat)
                        console.log($scope.env.user.chats)
                        $scope.env.user.chats.push(chat);
                        $scope.sound.play();
                    },function(error){
                        //console.log(error)
                    });
                    break;
                }
            }
        });


        var configPromise = configFactory.get().then(function (response) {
            $scope.env.config = response;
        });
        $scope.promises.push(configPromise);


        var userPromise = userFactory.getAuthUser().then(function (user) {
            $scope.env.user = user;
            if (!user) {
                $state.go('sign_in');
                return false;
            }
            if (user.hasAdminGroup()) {
                $state.go('users');
                return false;
            }

            user.getAllContacts().then(function (contacts) {
                user.contacts = contacts;
            });
            if (user.history == '1') {
                chatFactory.getByUser().then(function (chats) {
                    user.chats = chats;
                });
            } else {
                user.chats = [];
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

