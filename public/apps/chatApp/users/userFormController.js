(function () {

    'use strict';

    angular
        .module('chatApp')
        .controller('userFormController', userFormController);

    userFormController.$inject = ['$scope', 'userFactory', '$state', '$q'];

    function userFormController($scope, userFactory, $state, $q) {


        $scope.env = {
            saving: false,
            loading: true,
            user: null,
            model: {},
            id: $state.params.id,
            deffers: [],
            groups: [],
            users:[]
        };


        var usersDeffer = userFactory.getAll().then(function(users){
            for( var i in users){
                $scope.env.users.push(  users[i].login )
            }

        });
        $scope.env.deffers.push(usersDeffer);


        if ($scope.env.id != undefined) {
            var userDeffer = userFactory.getById($scope.env.id).then(function (user) {
                $scope.env.model = user;
                $scope.env.user = angular.copy(user);
                $scope.env.loading = false;
                console.log(user)
            });
            $scope.env.deffers.push(userDeffer)
        }

        $q.all($scope.env.deffers).then(function () {
            $scope.env.loading = false;
        });

        $scope.save = function (data) {
            $scope.env.saving = true;
            if ($scope.env.id == undefined) {
                userFactory.store(data).then(function (response) {
                    $scope.env.saving = false;
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        alertify.success('Пользователь создан');
                        $scope.env.model = {};
                        $state.go('users')
                    }
                })
            } else {
                $scope.env.user.update(data).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        alertify.success('Пользователь изменен');
                        $state.go('users')
                    }
                })
            }
        };



    }

})();