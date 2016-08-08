(function () {
    'use strict';
    angular.module('backApp').controller('companyController', companyController);

    companyController.$inject = ['$scope', '$q', 'companyFactory'];

    function companyController($scope, $q, companyFactory) {
        $scope.env = {
            companies: []
        };

        function initPage(deferred){

            var companiesPromise = companyFactory.getAllCompanies().then(function (companies) {
                $scope.env.loading = false;
                $scope.env.companies = companies;
                $scope.env.companiesSource = companies;
            });

            $q.all([companiesPromise]).then(function () {
                deferred.resolve();
            });

            return deferred.promise;
        }

        $scope.$parent.init.push(initPage);


    }
})();

