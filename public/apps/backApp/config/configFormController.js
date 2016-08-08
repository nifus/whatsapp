(function () {

    'use strict';

    angular
        .module('backApp')
        .controller('configFormController', configFormController);

    configFormController.$inject = ['$scope', 'configFactory', '$q'];

    function configFormController($scope, configFactory, $q) {

        $scope.env = {
            model: {},
            deffers: [],
            currency: []
        };

        function initPage(deferred, env) {

            $scope.env.model = env.config;
            $scope.env.currency = env.currency;


            $q.all($scope.env.deffers).then(function () {
                deferred.resolve();
            });

            return deferred.promise;
        }

        $scope.$parent.init.push(initPage);


        $scope.save = function (data) {
            $scope.env.saving = true;

            configFactory.update(data).then(function (response) {
                $scope.env.saving = false;
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Настройки изменены');
                }
            })

        };

    }

})();