(function (angular) {
    'use strict';

    function logTableDirective() {
        return {
            replace: true,
            restrict: 'E',
            controller: logTableController,
            templateUrl: 'apps/backApp/logTable/logTable.html',
            scope: {
                payment: '@'
            }
        };

        logTableController.$inject = ['$scope', 'logFactory', '$q'];

        function logTableController($scope, logFactory, $q) {

            $scope.env = {
                articles: [],
                logs:[]
            };
            $scope.tableConfig = {
                bindOnce: true,
                listItemsPerPage: [5, 25, 50, 100],
                itemsPerPage: 5,
                templateUrl: 'components/ng-tasty/template/table/pagination.html',
                init: {
                    'count': 5,
                    'page': 1,
                    'sortBy': 'name',
                    'sortOrder': 'dsc',
                    'filterBase': 1, // set false to disable
                    'filters': {
                        article_id: null
                    }
                }
            };


            var promises = [];


            $scope.getResource = function (params, paramsObj) {

                if (params == undefined) {
                    return;
                }

                var promisePaymentsLog = null;
                if ($scope.payment){
                    promisePaymentsLog = logFactory.getByPayment($scope.payment, params).then(__resourceCallback)
                }else{

                    promisePaymentsLog =  logFactory.getAll(params).then(__resourceCallback)
                }
                promises.push(promisePaymentsLog);

                return promisePaymentsLog;
            };

            function __resourceCallback(response) {

                $scope.env.logs = response.rows;
                return {
                    'rows': response.rows,
                    'header': [],
                    'pagination': response.pagination,
                    //'sortBy': response.data['sort-by'],
                    //'sortOrder': response.data['sort-order']
                }

            }



        }


    }

    angular.module('backApp').directive('logTable', logTableDirective);


})(window.angular);
