(function () {
    'use strict';
    angular.module('backApp').controller('agentProfileController', agentProfileController);

    agentProfileController.$inject = ['$scope', '$q', '$state', 'agentFactory'];

    function agentProfileController($scope, $q, $state, agentFactory) {

        $scope.env = {
            model: {},
            agent: null,
            id: $state.params.id,
            promises: [],
            uploadEnv: {
                loading: false,
                model: null,
                files: []
            }
        };


        function initPage(deferred){

            if ($scope.env.id != undefined) {
                var promiseAgent = agentFactory.getById($scope.env.id).then(function (response) {
                    $scope.env.model = response;
                    $scope.env.model.report_delivery = $scope.env.model.report_delivery+'';
                    $scope.env.agent = response;
                });
                $scope.env.promises.push(promiseAgent);
            }

            $q.all($scope.env.promises).then(function () {
                deferred.resolve();
            });

            return deferred.promise;
        }
        $scope.$parent.init.push(initPage);

        $scope.openCompany = function(id){
            $state.go('company-profile',{id: id})
        };

        $scope.save = function (data) {
            if ($scope.env.id == undefined) {
                agentFactory.store(data).then(function (response) {
                    if (response.success == true) {
                        alertify.success("Контрагент создан");
                        $state.go('agent-profile', {'id': response.agent.id})
                    }
                })
            } else {
                $scope.env.agent.update(data).then(function (response) {
                    if (response.success == true) {
                        alertify.success("Контрагент изменен");
                    }
                })
            }
        };


        $scope.removeFile = function (file, $index) {
            $scope.env.agent.deleteFile(file).then(function (response) {
                $scope.env.model.files.splice($index, 1);
                return $scope.env.agent.updateFiles($scope.env.model.files)

            }).then(function (response) {
                if (response.success == true) {
                    alertify.success("Файл удален");
                }
            })

        };

        $scope.upl = function (e, FileReader, File, FileList, FileObjects, Object) {

            $scope.env.uploadEnv.loading = true;
            $scope.env.uploadEnv.files.push(Object);
            if ($scope.env.uploadEnv.files.length != FileList.length) {
                return;
            }
            var promises = [];
            var files = [];
            if (!angular.isArray($scope.env.model.files)) {
                $scope.env.model.files = [];
            } else {
                files = $scope.env.model.files;
            }
            angular.forEach($scope.env.uploadEnv.files, function (file) {
                var promise = $scope.env.agent.uploadFile(file);
                promises.push(promise);
                promise.then(function (response) {
                    if (response.success != false) {
                        files.push(response);
                    } else {
                        alertify.error("Ошибка загрузки файла");
                    }
                })
            });

            $q.all(promises).then(function (response) {
                return $scope.env.agent.updateFiles(files)
            }).then(function () {
                $scope.env.model.files = files;
                alertify.success("Файлы сохранены");
                $scope.env.uploadEnv.loading = false;
                $scope.env.uploadEnv.files = [];
            });
        };


    }
})();

