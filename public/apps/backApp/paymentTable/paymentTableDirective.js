(function (angular) {
    'use strict';

    function paymentTableDirective() {
        return {
            replace: true,
            restrict: 'E',
            controller: paymentTableController,
            templateUrl: 'apps/backApp/paymentTable/paymentTable.html',
            scope: {
                company: '@',
                filters: '=',
                agent: '@'
            }
        };

        paymentTableController.$inject = ['$scope', 'paymentFactory', 'agentFactory', 'articleFactory', '$auth', '$state'];
        function paymentTableController($scope, paymentFactory, agentFactory, articleFactory, $auth, $state) {

            $scope.env = {
                agents: [],
                articles: [],
                lastParamtr: null,
                selectedPayments:[]
            };
            $scope.tableConfig = {
                bindOnce: true,
                listItemsPerPage: [5, 25, 50, 100],
                itemsPerPage: 5,
                templateUrl: 'components/ng-tasty/template/table/pagination.html',
                init: {
                    'count': 75,
                    'page': 1,
                    'sortBy': 'name',
                    'sortOrder': 'dsc',
                    'filterBase': 1, // set false to disable
                    'cols': {
                        'pik': true,
                        'pc': true,
                        'pndpp': true,
                        'pks': true,
                        'pkp': true,
                        'pki': true,
                        'okp': true,
                        'oks': true,
                        'oki': true,
                        'ai': true,
                        'aic': true,
                        'akp': true,
                        'aku': true,
                        'zik': true,
                        'zs': true,
                        'znlpp': true,
                        'zks': true,
                        'zkp': true,
                        'zki': true,
                        'zsi': true
                    },
                    'filters': {
                        article_id: null
                    }
                }
            };
            $scope.token = $auth.getToken();

            $scope.payments = [];
            var prefix = $scope.company != undefined ? 'company' : ($scope.agent != undefined ? "agent" : "all");

            var promises = [];

            if (localStorage.getItem(prefix + "LegendTableSettings")) {
                $scope.tableConfig.init.cols = JSON.parse(localStorage.getItem(prefix + "LegendTableSettings"))
            }

            if (localStorage.getItem(prefix + "Filters")) {
                $scope.tableConfig.init.filters = JSON.parse(localStorage.getItem(prefix + "Filters"));
                $scope.tableConfig.init.count = $scope.tableConfig.init.count * 1;
            }


            var agentsPromise = agentFactory.getAllAgent().then(function (agents) {
                for (var i in agents) {
                    $scope.env.agents[agents[i].id] = agents[i]
                }
            });
            promises.push(agentsPromise);

            var articlesPromise = articleFactory.getAllArticle().then(function (articles) {
                $scope.env.articles = articles;
            });
            promises.push(articlesPromise);


            $scope.$watch('tableConfig.init', function (value) {
                if (typeof(Storage) !== "undefined") {
                    localStorage.setItem(prefix + "LegendTableSettings", JSON.stringify(value.cols));
                    localStorage.setItem(prefix + "Filters", JSON.stringify(value.filters));
                }
            }, true);


            $scope.getResource = function (params, paramsObj) {
                var filters = {};
                angular.forEach($scope.filters, function(key,value){
                    if (key!=undefined){
                        filters[value]=key;
                    }
                });

                params = params+"&"+serialize(filters);

                $scope.env.lastParamtr = params;
                if (params == undefined) {
                    return;
                }

                var promisePayments = null;

                if ($scope.company)
                    promisePayments = paymentFactory.getByCompany($scope.company, params).then(__resourceCallback);
                if ($scope.agent)
                    promisePayments = paymentFactory.getByAgent($scope.agent, params).then(__resourceCallback);
                if (!$scope.agent && !$scope.company)
                    promisePayments = paymentFactory.getAll(params).then(__resourceCallback);
                promises.push(promisePayments);

                return promisePayments;
            };

            function __resourceCallback(response) {
                $scope.env.payments = response.rows;
                return {
                    'rows': response.rows,
                    'header': [],
                    'pagination': response.pagination,
                    //'sortBy': response.data['sort-by'],
                    //'sortOrder': response.data['sort-order']
                }

            }



            $scope.getAgentById = function (agent_id) {
                return $scope.env.agents[agent_id]
            };


            $scope.edit = function (id) {
                $state.go('payments-edit', {id: id})
            };

            $scope.pdfExport = function(){
                window.open("/backend/payment/pdf?token="+$scope.token+"&"+$scope.env.lastParamtr+"&cols="+JSON.stringify($scope.tableConfig.init.cols),'_blank');
            };

            $scope.removeSelected = function(selected){
                var res = confirm( 'Удалить выбранные записи?' );
                if ( !res ){
                    return false;
                }
                var removed = [];
                for( var i in selected){
                    if (selected[i]==true){
                        removed.push(i);
                    }
                }
                paymentFactory.removeSelectedPayments(removed).then(function(){
                    $scope.tableConfig.init.filters.reload = !$scope.tableConfig.init.filters.reload;

                });


            };

             function serialize(obj) {
                var str = [];
                for(var p in obj)
                    if (obj.hasOwnProperty(p)) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                return str.join("&");
            }
        }


    }

    angular.module('backApp').directive('paymentTable', paymentTableDirective);


})(window.angular);
