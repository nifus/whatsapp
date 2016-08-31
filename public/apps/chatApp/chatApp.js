(function (angular, window) {
    'use strict';
    angular.module('chatApp', ['ui.router', 'satellizer', 'core', 'ngCookies','naif.base64','cfp.hotkeys']).
    config(function ($stateProvider, $urlRouterProvider, $authProvider) {

        var href = window.location.href;
        if (href.indexOf('chat.dev') == -1) {
            window.SERVER = 'http://62.76.185.138:8080';
        } else {
            window.SERVER = 'http://chat.dev';
        }

       // $authProvider.httpInterceptor = false;
        $authProvider.loginUrl = window.SERVER+'/backend/user/authenticate';
        $authProvider.signupUrl = window.SERVER+'/backend/user/register';


        $urlRouterProvider.otherwise('/');

        $stateProvider.state('sign_in', {
            url: '/',
            templateUrl: 'apps/chatApp/signIn/signIn.html',
            controller: 'signInController'
        }).state('chat', {
            url: '/chat',
            templateUrl: 'apps/chatApp/chat/chat.html',
            controller: 'chatController'
        }).state('users', {
            url: '/users',
            templateUrl: 'apps/chatApp/users/userList.html',
            controller: 'userListController'
        }).state('users-edit', {
            url: '/users/edit/:id',
            templateUrl: 'apps/chatApp/users/userForm.html',
            controller: 'userFormController'
        }).state('users-create', {
            url: '/users/create',
            templateUrl: 'apps/chatApp/users/userForm.html',
            controller: 'userFormController'
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
                /* if (user == null) {
                    window.location.href = '/'
                }

                if (value['accessSection'] != undefined) {
                    if (user == null || !user.hasAccess(value['accessSection'])) {
                        window.history.back();
                        return;
                    }
                }*/
            });
        }, true);

    }]).filter('to_trusted', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }])

})(angular, window);


