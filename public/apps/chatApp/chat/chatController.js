(function () {
    'use strict';
    angular.module('chatApp').controller('chatController', chatController);

    chatController.$inject = ['$scope', 'userFactory', '$q', 'chatFactory'];

    function chatController($scope, userFactory, $q, chatFactory) {
        var $promises = [];
        $scope.env = {
            agents: [],
            chat: undefined,
            show_add_info: true
        };
        function initPage(deferred){
            $scope.user = $scope.$parent.env.user;

            return deferred.promise;
        }
       // initPage();
        $scope.$parent.init.push(initPage);


        $scope.$watch('env.chat', function(chat){
            if (!chat){
                return;
            }
            chat.getPosts().then(function(response){
                console.log(response)
            })
        })


    }
})();

