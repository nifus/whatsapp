(function () {

    'use strict';

    angular
        .module('backApp')
        .controller('usersFormController', usersFormController);

    usersFormController.$inject = ['$scope', 'userFactory', '$state', '$q', 'groupFactory', '$filter'];

    function usersFormController($scope, userFactory, $state, $q, groupFactory, $filter) {


        $scope.env = {
            saving: false,
            loading: true,
            user: null,
            model: {},
            id: $state.params.id,
            deffers: [],
            groups: []
        };

        var groupDeffer = groupFactory.getAll().then(function (groups) {
            $scope.env.groups = groups;
        });
        $scope.env.deffers.push(groupDeffer);




        if ($scope.env.id != undefined) {
            var userDeffer = userFactory.getById($scope.env.id).then(function (user) {
                $scope.env.model = user;
                $scope.env.user = angular.copy(user);
                $scope.env.loading = false;
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
                        $scope.env.model = {}
                    }
                })
            } else {
                $scope.env.user.update(data).then(function (response) {
                    if (response.success == false) {
                        alertify.error(response.error);
                    } else {
                        alertify.success('Пользователь изменен');

                    }
                })
            }
        };

    }

})();