(function (angular, window) {
    'use strict';
    angular.module('backApp', ['ui.router', 'satellizer', 'core', 'ngCookies', 'naif.base64', 'dynamicNumber', 'smart-table', 'ngTasty', 'checklist-model','fiestah.money','ui.bootstrap.datetimepicker']).
    config(function ($stateProvider, $urlRouterProvider) {
        var href = window.location.href;
        if (href.indexOf('pr69-fin.dev') == -1) {
            window.SERVER = 'http://bitfin.org';
        } else {
            window.SERVER = 'http://pr69-fin.dev';
        }

        $urlRouterProvider.otherwise('/total-stats');

        $stateProvider.state('users', {
            url: '/users',
            templateUrl: 'apps/backApp/users/usersList.html',
            controller: 'usersListController',
            accessSection: 'users',
            accessType: 'read'
        }).state('users-create', {
            url: '/users/create',
            templateUrl: 'apps/backApp/users/usersForm.html',
            controller: 'usersFormController',
            accessSection: 'users',
            accessType: 'edit'
        }).state('users-edit', {
            url: '/users/:id',
            templateUrl: 'apps/backApp/users/usersForm.html',
            controller: 'usersFormController',
            accessSection: 'users',
            accessType: 'edit'
        }).state('events', {
            url: '/events',
            templateUrl: 'apps/backApp/event/eventList.html',
            controller: 'eventListController',
            accessSection: 'events',
            accessType: 'read'
        }).state('events-user', {
            url: '/events/user:id',
            templateUrl: 'apps/backApp/event/eventList.html',
            controller: 'eventListController',
            accessSection: 'events',
            accessType: 'read'
        }).state('articles', {
            url: '/articles',
            templateUrl: 'apps/backApp/articles/articles.html',
            controller: 'articleController'
        }).state('articles-create', {
            url: '/articles/:id',
            templateUrl: 'apps/backApp/articles/articlesForm.html',
            controller: 'articlesFormController'
        }).state('agents', {
            url: '/agents',
            templateUrl: 'apps/backApp/agents/agent.html',
            controller: 'agentController'
        }).state('agent-profile', {
            url: '/agent/profile/:id',
            templateUrl: 'apps/backApp/agents/agentProfile.html',
            controller: 'agentProfileController'
        }).state('agent-create', {
            url: '/agent/create',
            templateUrl: 'apps/backApp/agents/agentProfile.html',
            controller: 'agentProfileController'
        }).state('company', {
            url: '/company',
            templateUrl: 'apps/backApp/company/company.html',
            controller: 'companyController'
        }).state('company-create', {
            url: '/company/create?agent_id',
            templateUrl: 'apps/backApp/company/companyProfile.html',
            controller: 'companyProfileController'
        }).state('company-profile', {
            url: '/company/profile/:id',
            templateUrl: 'apps/backApp/company/companyProfile.html',
            controller: 'companyProfileController'
        }).state('logs', {
            url: '/logs',
            templateUrl: 'apps/backApp/logs/logs.html',
            controller: 'logsController'
        }).state('payments', {
            url: '/payments',
            templateUrl: 'apps/backApp/payments/paymentsList.html',
            controller: 'paymentsListController'
        }).state('payments-add', {
            url: '/payments/add',
            templateUrl: 'apps/backApp/payments/paymentsForm.html',
            controller: 'paymentsFormController'
        }).state('payments-edit', {
            url: '/payments/:id',
            templateUrl: 'apps/backApp/payments/paymentsForm.html',
            controller: 'paymentsFormController'
        }).state('payments-search', {
            url: '/payments-search?operator_profit&article_id&client_invoice&operator_company_id&client_agent_id&profit&agent_id&supplier_invoice&supplier_company_id&supplier_agent_id&end_date&begin_date',
            templateUrl: 'apps/backApp/payments/paymentsSearchList.html',
            controller: 'paymentsSearchListController',

        }).state('total-stats', {
            url: '/total-stats',
            templateUrl: 'apps/backApp/totalStats/totalStats.html',
            controller: 'totalStatsController'
        }).state('config', {
            url: '/config',
            templateUrl: 'apps/backApp/config/configForm.html',
            controller: 'configFormController'
        })


    }).
    run(['userFactory', '$state', '$rootScope', function (userFactory, $state, $rootScope) {
        moment.locale('ru');


        $rootScope.$watch(function () {
            return $state.current
        }, function (value) {
            if (value == undefined) {
                return;
            }


            userFactory.getAuthUser().then(function (user) {
                if (user == null) {
                    window.location.href = '/'
                }

                if (value['accessSection'] != undefined) {
                    if (user == null || !user.hasAccess(value['accessSection'])) {
                        window.history.back();
                        return;
                    }
                }
            });
        }, true);

    }]).filter('to_trusted', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }])

})(angular, window);


