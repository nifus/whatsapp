(function () {
    'use strict';
    angular.module('frontApp').controller('chatController', chatController);

    chatController.$inject = ['$scope', 'userFactory', '$q', 'chatFactory'];

    function chatController($scope, userFactory, $q, chatFactory) {
        $scope.env = {
            agents: [],
            promises: [],
            chat:{
                name:undefined
            }

        };

        function initPage(deferred){

            var userPromise = userFactory.getAll().then(function (users) {
                $scope.env.users = users;
                //console.log(users)
            });

            var chatPromise = chatFactory.getAll().then(function (chats) {
                $scope.env.chats = chats;
                console.log(chats)

            });

            $q.all([userPromise,chatPromise]).then(function () {
                deferred.resolve();
            });

            return deferred.promise;
        }
       // initPage();
        $scope.$parent.init.push(initPage);





    }
})();

