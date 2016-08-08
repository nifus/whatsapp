(function () {
    'use strict';
    angular.module('backApp').controller('paymentsFormController', paymentsFormController);

    paymentsFormController.$inject = ['$scope', '$state', '$q', 'agentFactory', 'companyFactory', 'configFactory', 'exchangeFactory', 'articleFactory', 'paymentFactory'];

    function paymentsFormController($scope, $state, $q, agentFactory, companyFactory, configFactory, exchangeFactory, articleFactory, paymentFactory) {
        moment.locale('en');

        $scope.env = {
            id: $state.params.id,
            payment: null,
            loading: true,
            saving: false,
            agents: [],
            articles: [],
            promises: [],
            model: {
                supplier_amount_currency: 'RUB',
                supplier_commission_currency: 'RUB',
                supplier_calculation: 'Минусом',
                supplier_amount_type: 'Безналичные',
                //supplier_amount: 0,
                //supplier_commission_percent: 0,
                supplier_invoice: 'Требуется',
                operator_where_profits: 'Заказчик',
                operator_calculation: 'Минусом',
                operator_commission_currency: 'RUB',
                agents: [],
                agent_where_commission: 'От оператора',
                payment_number: null,
                payment_date: moment().format('YYYY-MM-DD'),
                client_amount_currency: 'RUB',
                client_commission_currency: 'RUB',
                client_calculation: 'Минусом',
                client_invoice: 'Требуется',
                client_amount_type: 'Безналичные'
            },
            supplierCompanies: [],
            agentCompanies: []
        };
        $scope.model = $scope.env.model;

        //  список статей
        var promiseArticles = articleFactory.getAllArticle().then(function (articles) {
            $scope.env.articles = articles;
        });
        $scope.env.promises.push(promiseArticles);

        //  список агентов
        var promiseAgents = agentFactory.getAllAgent().then(function (agents) {
            $scope.env.agents = agents;
        });
        $scope.env.promises.push(promiseAgents);

        //  настройки
        var promiseConfig = configFactory.getAll().then(function (config) {
            $scope.env.config = config;
            $scope.model.supplier_amount_currency = config.defaultCurrency;
            $scope.model.supplier_commission_currency = config.defaultCurrency;
        });
        $scope.env.promises.push(promiseConfig);

        //  валюты
        var exPromise = exchangeFactory.getExchange().then(function (exchanges) {
            $scope.env.allExchanges = exchanges;
        });
        $scope.env.promises.push(exPromise);


        if ($scope.env.id == undefined) {
            //  свободный номер для проводки
            var promiseNumber = paymentFactory.getNextId().then(function (number) {
                $scope.model.payment_number = number;
            });
            $scope.env.promises.push(promiseNumber);
        } else {
            //  данные о проводке
            paymentFactory.getById($scope.env.id).then(function (response) {
                $scope.payment = response;
                $scope.model = response;
            });
        }

        //  Общая загрузка
        $q.all($scope.env.promises).then(function () {
            $scope.env.loading = false;
            $scope.env.exchanges = $scope.env.allExchanges[$scope.env.config.defaultCurrency];
            rematchExchange();
            rematchResults();
        });


        //  методы

        /**
         * Добавить агента
         */
        $scope.addAgent = function () {
            var commission_exchange;
            var exchanges= $scope.env.allExchanges[$scope.model.supplier_amount_currency];
            if ( $scope.model.agent_where_commission == 'От оператора' ){
                exchanges = $scope.env.allExchanges[$scope.model.operator_commission_currency];
                commission_exchange = exchanges['RUB'].reverse_conversion;
            }else{
                commission_exchange = exchanges['RUB'].reverse_conversion;
            }

            $scope.model.agents.push({
                commission_currency: 'RUB',
                calculation: 'Минусом',
                commission_exchange: commission_exchange

            })
        };
        /**
         * удалить агента
         */
        $scope.removeAgent = function ($index) {
            $scope.model.agents.splice($index, 1)
        };


        /**
         * Сохранить проводку
         * @param data
         * @param redirect
         */
        $scope.save = function (data, redirect) {
            $scope.env.saving = true;
            var promise = ( $scope.env.id ) ? $scope.payment.update(data) : paymentFactory.store(data)

            promise.then(function (response) {
                if (response.success == true) {
                    alertify.success('Проводка сохранена');
                    $scope.env.payment = response.payment;

                    $scope.env.id = response.payment.id;
                    $scope.env.model = response.payment;
                    localStorage.setItem("payment_" + $scope.model.payment_number, null);
                    if (redirect) {
                        $state.go('payments')
                    } else {
                        $state.go('payments-edit', {id: response.payment.id})
                    }
                }
                $scope.env.saving = false;
            })

        };


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
                $scope.env.agentCompanies = response
            })
        });


        $scope.$watch(function () {
            return [
                $scope.model.supplier_invoice,
                $scope.model.supplier_date_pp,
                $scope.model.supplier_number_pp,
                $scope.model.supplier_files,
                $scope.model.supplier_invoice_received,
                $scope.model.client_invoice_received,
                $scope.model.client_date_pp,
                $scope.model.client_number_pp,
                $scope.model.client_files,
                $scope.model.client_invoice,
            ]
        }, function () {
            $scope.model.status = 'complete';
            if ($scope.model.supplier_invoice == 'Требуется') {
                if (!$scope.model.supplier_date_pp || !$scope.model.supplier_number_pp || $scope.model.supplier_files.length == 0) {
                    $scope.model.status = 'new';
                }

            }
            if ($scope.model.client_invoice == 'Требуется') {
                if (!$scope.model.client_date_pp || !$scope.model.client_number_pp || $scope.model.client_files.length == 0) {
                    $scope.model.status = 'new';
                }
            }
        }, true);


        $scope.$watch(function () {
            return [
                $scope.model.supplier_commission_currency,
                $scope.model.supplier_amount_currency,
                $scope.model.operator_commission_currency,
                $scope.model.agents,
                $scope.model.client_amount_currency,
                $scope.model.client_commission_currency,
                $scope.model.client_amount_currency

            ]
        }, function () {
            if (!$scope.env.allExchanges) {
                return;
            }
            //rematchExchange()
        }, true);

        $scope.$watch('model.agents', function (value) {
            rematchResults();
        }, true);


        $scope.$watchCollection(function () {
            return [
                $scope.model.supplier_amount,
                $scope.model.supplier_amount_currency,

                $scope.model.supplier_commission_percent,
                $scope.model.supplier_calculation,
                $scope.model.supplier_commission_fix,
                $scope.model.supplier_commission_currency,
                $scope.model.supplier_commission_exchange,


                $scope.model.operator_commission_percent,
                $scope.model.operator_calculation,
                $scope.model.operator_commission_fix,
                $scope.model.operator_commission_currency,
                $scope.model.operator_commission_exchange,
                $scope.model.agents,

                $scope.model.client_commission_percent,
                $scope.model.client_calculation,
                $scope.model.client_commission_fix,
                $scope.model.client_commission_exchange,

                $scope.model.client_amount_currency,
                $scope.model.agent_where_commission,

                $scope.model.client_amount_exchange

            ]
        }, function (value) {
            rematchResults();
        });

        $scope.rematchSelectExchange = function (type, currency, agent) {
            var exchanges = $scope.env.allExchanges[$scope.model.supplier_amount_currency];


            if (type == 'supplier') {
                $scope.model.supplier_commission_exchange = exchanges[currency].reverse_conversion;
            }else if (type == 'operator') {
                $scope.model.operator_commission_exchange = exchanges[currency].reverse_conversion;
                for (var i in $scope.model.agents) {
                    if ( $scope.model.agent_where_commission == 'От оператора' ){
                        exchanges = $scope.env.allExchanges[$scope.model.operator_commission_currency];
                        $scope.model.agents[i].commission_exchange = exchanges[$scope.model.agents[i].commission_currency].reverse_conversion;
                    }else{
                        $scope.model.agents[i].commission_exchange = exchanges[$scope.model.agents[i].commission_currency].reverse_conversion;
                    }
                }

            }else if (type == 'agent') {
                if ( $scope.model.agent_where_commission == 'От оператора' ){
                    exchanges = $scope.env.allExchanges[$scope.model.operator_commission_currency];
                }

                agent.commission_exchange = exchanges[currency].reverse_conversion;
            }else if (type == 'client') {
                //$scope.model.operator_commission_exchange = exchanges[currency].reverse_conversion;
                $scope.model.client_commission_exchange = exchanges[currency].reverse_conversion;
            }else if (type == 'client_exit') {
                $scope.model.client_amount_exchange = exchanges[currency].reverse_conversion;
            }
        };


        function rematchExchange() {

            if (!$scope.env.allExchanges) {
                return;
            }
            var exchanges = $scope.env.allExchanges[$scope.model.supplier_amount_currency];

            $scope.env.exchanges = exchanges;

            $scope.model.supplier_commission_exchange = exchanges[$scope.model.supplier_commission_currency].reverse_conversion;
            $scope.model.operator_commission_exchange = exchanges[$scope.model.operator_commission_currency].reverse_conversion;
            for (var i in $scope.model.agents) {
                $scope.model.agents[i].commission_exchange = exchanges[$scope.model.agents[i].commission_currency].reverse_conversion;
            }

            $scope.model.client_commission_exchange = exchanges[$scope.model.client_commission_currency].reverse_conversion;
            $scope.model.client_amount_exchange = exchanges[$scope.model.client_amount_currency].reverse_conversion;

        }

        $scope.rematchExchange = function () {
            if (!$scope.env.allExchanges) {
                return;
            }
            var exchanges = $scope.env.allExchanges[$scope.model.supplier_amount_currency];

            $scope.env.exchanges = exchanges;

            $scope.model.supplier_commission_exchange = exchanges[$scope.model.supplier_commission_currency].reverse_conversion;
            $scope.model.operator_commission_exchange = exchanges[$scope.model.operator_commission_currency].reverse_conversion;
            for (var i in $scope.model.agents) {
                $scope.model.agents[i].commission_exchange = exchanges[$scope.model.agents[i].commission_currency].reverse_conversion;
            }

            $scope.model.client_commission_exchange = exchanges[$scope.model.client_commission_currency].reverse_conversion;
            $scope.model.client_amount_exchange = exchanges[$scope.model.client_amount_currency].reverse_conversion;

        }

        function rematchResults() {


            $scope.model.supplier_result = calculate(
                $scope.model.supplier_amount,
                $scope.model.supplier_amount_currency,
                $scope.model.supplier_commission_fix,
                $scope.model.supplier_commission_currency,
                $scope.model.supplier_commission_percent,
                $scope.model.supplier_calculation,
                $scope.model.supplier_commission_exchange
            );

            if ( $scope.model.supplier_amount_currency!=$scope.model.supplier_commission_currency ){
                $scope.model.supplier_commission_total = $scope.model.supplier_result*$scope.model.supplier_commission_exchange;
            }else{
                $scope.model.supplier_commission_total = $scope.model.supplier_result;
            }

            $scope.model.operator_result = calculate(
                $scope.model.supplier_amount,
                $scope.model.supplier_amount_currency,
                $scope.model.operator_commission_fix,
                $scope.model.operator_commission_currency,
                $scope.model.operator_commission_percent,
                $scope.model.operator_calculation,
                $scope.model.operator_commission_exchange
            );

            if ( $scope.model.supplier_amount_currency!=$scope.model.operator_commission_currency ){
                $scope.model.operator_commission_total = $scope.model.operator_result*$scope.model.operator_commission_exchange;
            }else{
                $scope.model.operator_commission_total = $scope.model.operator_result;
            }


           // $scope.model.operator_commission_total = $scope.model.operator_result;

            if ($scope.model.agent_where_commission == 'От оператора') {
                $scope.model.agents_result = $scope.model.operator_result;
            } else {
                //Общая с оператором
                $scope.model.agents_result = $scope.model.supplier_amount;
            }

            var total_agents = 0;
            angular.forEach($scope.model.agents, function (agent) {
                if ($scope.model.agent_where_commission == 'От оператора' ){


                    agent.result = calculate(
                        $scope.model.agents_result,
                        $scope.model.operator_commission_currency,
                        agent.commission_fix,
                        agent.commission_currency,
                        agent.commission_percent,
                        agent.calculation,
                        agent.commission_exchange);
                }else{
                    agent.result = calculate(
                        $scope.model.agents_result,
                        $scope.model.supplier_amount_currency,
                        agent.commission_fix,
                        agent.commission_currency,
                        agent.commission_percent,
                        agent.calculation,
                        agent.commission_exchange);
                }


                if ( $scope.model.operator_commission_currency!=agent.commission_currency ){
                    total_agents += agent.result*agent.commission_exchange
                }else{
                    total_agents += agent.result
                }
            });

            //console.log('agents_result-' + $scope.model.agents_result)


            $scope.model.client_result = calculate(
                $scope.model.supplier_amount,
                $scope.model.supplier_amount_currency,
                $scope.model.client_commission_fix,
                $scope.model.client_commission_currency,
                $scope.model.client_commission_percent,
                $scope.model.client_calculation,
                $scope.model.client_commission_exchange);

            if ( $scope.model.supplier_amount_currency!=$scope.model.client_commission_currency ){
                $scope.model.client_commission_total = $scope.model.client_result*$scope.model.client_commission_exchange;
            }else{
                $scope.model.client_commission_total = $scope.model.client_result;
            }
           // $scope.model.client_commission_total = $scope.model.client_result;


            if ($scope.model.agent_where_commission == 'От оператора') {
                $scope.model.output = $scope.model.supplier_amount - $scope.model.supplier_commission_total - $scope.model.operator_commission_total - total_agents - $scope.model.client_commission_total;
            } else {
                $scope.model.output = $scope.model.supplier_amount - $scope.model.supplier_commission_total - $scope.model.operator_commission_total - $scope.model.client_commission_total;
            }


            $scope.model.total = $scope.model.output;
            if ($scope.model.supplier_amount_currency != $scope.model.client_amount_currency) {
                $scope.model.total = ($scope.model.total / $scope.model.client_amount_exchange)
            }
        }


        function calculate(price, price_currency, fix_commission, fix_commission_currency, percent_commission, calculate_type, exchange) {

            if (!price) {
                return null;
            }
            percent_commission = percent_commission * 1;
            var result = 0;

            if (percent_commission > 0) {

                if (calculate_type == 'Минусом') {
                    if (fix_commission_currency == price_currency) {
                        result = ( (price / 100) * percent_commission);
                    } else {
                        //var ex = exchange;//$scope.env.exchanges[fix_commission_currency].reverse_conversion;
                        result = ((price / exchange) / 100) * percent_commission;
                    }
                } else {
                    var pers = ( (percent_commission * 0.01) + 1 );
                    if (fix_commission_currency == price_currency) {
                        result = price - (price / pers);
                    } else {
                        // var ex = exchange//$scope.env.exchanges[fix_commission_currency].reverse_conversion;
                        result = price / exchange - ((price / exchange) / pers);
                    }
                }
            }

            if (fix_commission > 0) {
                //if (fix_commission_currency == price_currency) {
                result += fix_commission;
                // } else {

                //    var ex = $scope.env.exchanges[fix_commission_currency].reverse_conversion;
                //    result += (100 / ( price / ex)) *
                // }
            }


            return result;
        }

    }
})();

