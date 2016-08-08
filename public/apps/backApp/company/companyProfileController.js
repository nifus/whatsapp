(function () {
    'use strict';
    angular.module('backApp').controller('companyProfileController', companyProfileController);

    companyProfileController.$inject = ['$scope', '$q', '$state', 'companyFactory', 'agentFactory'];

    function companyProfileController($scope, $q, $state, companyFactory, agentFactory) {

        $scope.env = {
            id: $state.params.id,
            model: {
                agent_id: $state.params.agent_id ? $state.params.agent_id*1 : null
            },
            company: null,
            promises: [],
            agents: [],
            uploadEnv: {
                loading: false,
                model: null,
                files: []
            }
        };


        function initPage(deferred){

            $scope.env.table = JSON.parse(localStorage.getItem("legendTableSettings"));

            if ($scope.env.id != undefined) {
                var companyPromise = companyFactory.getById($scope.env.id).then(function (company) {
                    $scope.env.model = company;
                    $scope.env.company = company;
                });
                $scope.env.promises.push(companyPromise);
            }

            var agentsPromise = agentFactory.getAllAgent().then(function (agents) {
                $scope.env.agents = agents;
            });
            $scope.env.promises.push(agentsPromise);


            $q.all($scope.env.promises).then(function () {
                deferred.resolve();
            });

            return deferred.promise;
        }

        $scope.$parent.init.push(initPage);



        $scope.addNewCompanyAcc = function () {
            if (!angular.isArray($scope.env.model.company_accounts)) {
                $scope.env.model.company_accounts = [];
            }
            $scope.env.model.company_accounts.push({});
        };

        $scope.removeCompanyAcc = function (account, $index) {
            if (account.id == undefined) {
                $scope.env.model.company_accounts.splice($index, 1);
                alertify.success("Счет удален");
            } else {
                $scope.env.company.deleteAccount(account.id).then(function (response) {
                    if (response.success == true) {
                        $scope.env.model.company_accounts.splice($index, 1);
                        alertify.success("Счет удален");
                    }
                })
            }
        };

        $scope.save = function (data) {
            if ($scope.env.id == undefined) {
                companyFactory.store(data).then(function (response) {
                    if (response.success == true) {
                        alertify.success("Компания создана");
                        $state.go('company-profile', {'id': response.company.id})
                    }
                })
            } else {
                $scope.env.company.update(data).then(function (response) {
                    if (response.success == true) {
                        alertify.success("Компания изменена");
                    }
                })
            }
        };


        $scope.removeFile = function (file, $index) {
            $scope.env.company.deleteFile(file).then(function (response) {
                $scope.env.model.files.splice($index, 1);
                return $scope.env.company.updateFiles($scope.env.model.files)

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
                var promise = $scope.env.company.uploadFile(file);
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
                return $scope.env.company.updateFiles(files)
            }).then(function () {
                $scope.env.model.files = files;
                alertify.success("Файлы сохранены");
                $scope.env.uploadEnv.loading = false;
                $scope.env.uploadEnv.files = [];
            });
        }


    }
})();

