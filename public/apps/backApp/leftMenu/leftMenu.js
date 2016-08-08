(function (angular) {
    'use strict';

    function leftMenuDirective() {
        return {
            replace: true,
            restrict: 'E',
            controller: leftMenuController,
            templateUrl: 'apps/backApp/leftMenu/leftMenu.html',
            scope: {}
        };

        leftMenuController.$inject = ['$scope', '$state', 'agentFactory', 'companyFactory', 'articleFactory','$q'];
        function leftMenuController($scope, $state, agentFactory, companyFactory, articleFactory,$q) {
            $scope.env = {
                showLogin: false,
                user: undefined,
                agents: [],
                supplierCompanies: [],
                operatorCompanies: [],
                companies: [],
                articles: [],
                promises:[]
            };

            $scope.model = {
                supplier_agent_id: $state.params.supplier_agent_id != undefined ? $state.params.supplier_agent_id * 1 : null,
                supplier_company_id: ($state.params.supplier_company_id != undefined ? $state.params.supplier_company_id * 1 : null),
                supplier_invoice: $state.params.supplier_invoice != undefined ? $state.params.supplier_invoice : null,
                agent_id: $state.params.agent_id != undefined ? $state.params.agent_id * 1 : null,
                profit: $state.params.profit != undefined ? $state.params.profit : null,
                client_agent_id: $state.params.client_agent_id != undefined ? $state.params.client_agent_id * 1 : null,
                client_company_id: $state.params.client_company_id != undefined ? $state.params.client_company_id * 1 : null,
                article_id: $state.params.article_id != undefined ? $state.params.article_id * 1 : null,
                operator_profit:  $state.params.operator_profit != undefined ? $state.params.operator_profit : null,
                client_invoice: $state.params.client_invoice != undefined ? $state.params.client_invoice : null,
                begin_date: $state.params.begin_date != undefined ?  $state.params.begin_date: null,
                end_date: $state.params.end_date != undefined ? $state.params.end_date : null
            };

            function initPage(deferred, env){

               // console.log(env)
               // console.log('left loaded')
                $scope.env.user = env.user
                var articlesPromise = articleFactory.getAllArticle().then(function (articles) {
                    $scope.env.articles = articles;
                });
                $scope.env.promises.push(articlesPromise);

                var agentPromise = agentFactory.getAllAgent().then(function (agents) {
                    $scope.env.agents = agents;
                });
                $scope.env.promises.push(agentPromise);

                var companyPromise = companyFactory.getAllCompanies().then(function (companies) {
                    $scope.env.companies = companies;
                    $scope.env.supplierCompanies = companies;
                    $scope.env.operatorCompanies = companies;
                });
                $scope.env.promises.push(companyPromise);

                $q.all($scope.env.promises).then(function () {
                    deferred.resolve();
                });
                return deferred.promise;
            }

            $scope.$parent.init.push(initPage);




            $scope.$watch('model.supplier_agent_id', function (value) {
                if (!value) {
                    $scope.env.supplierCompanies = $scope.env.companies;
                    return false;
                }
                companyFactory.getCompaniesByAgent(value).then(function (response) {
                    $scope.env.supplierCompanies = response
                })
            });
            $scope.$watch('model.supplier_agent_id', function (value) {
                if (!value) {
                    return false;
                }
                companyFactory.getCompaniesByAgent(value).then(function (response) {
                    $scope.env.supplierCompanies = response
                })
            });
            $scope.$watch('model.client_agent_id', function (value) {
                if (!value) {
                    return false;
                }
                companyFactory.getCompaniesByAgent(value).then(function (response) {
                    $scope.env.operatorCompanies = response
                })
            });

            $scope.$watch('model.begin_date', function (value) {
                if (!value) {
                    return false;
                }
                $scope.model.begin_date = moment(value).format('YYYY-MM-DD')
            });

            $scope.$watch('model.end_date', function (value) {
                if (!value) {
                    return false;
                }
                $scope.model.end_date = moment(value).format('YYYY-MM-DD')
            });
        }


    }

    angular.module('backApp').directive('leftMenu', leftMenuDirective);


})(window.angular);
