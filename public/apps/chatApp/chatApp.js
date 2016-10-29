(function (angular, window) {
    'use strict';
    angular.module('chatApp', ['ui.router', 'satellizer', 'core', 'ngCookies', 'naif.base64', 'cfp.hotkeys', 'luegg.directives', 'ckeditor', 'ngSanitize', 'btford.socket-io', 'ngAudio', 'ngScrollbars', 'contenteditable']).config(function ($stateProvider, $urlRouterProvider, $authProvider) {

        window.SERVER = window.location.protocol+'//' + window.location.host;

        // $authProvider.httpInterceptor = false;
        $authProvider.loginUrl = window.SERVER + '/backend/user/authenticate';
        $authProvider.signupUrl = window.SERVER + '/backend/user/register';


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
        }).state('config', {
            url: '/config',
            templateUrl: 'apps/chatApp/config/config.html',
            controller: 'configController'
        })


    }).factory('socket', function (socketFactory) {

        var hosts = {
            'dikom.org': 'https://nodesrv.2gt.biz:3001',
            'subriz.com': 'https://nodesrv.2gt.biz:3002',
            'finehill.org': 'https://nodesrv.2gt.biz:3003',
            'flowemt.com': 'https://nodesrv.2gt.biz:3004',
            'supportim.org': 'https://nodesrv.2gt.biz:3005',
            'testchat.2gt.biz': 'https://nodesrv.2gt.biz:4000',
            'chat.dev': 'http://'+ window.location.host + ':3000',
            'chat.bunzya.ru': 'http://'+ window.location.host + ':3000'
        };


            var host = hosts[window.location.host];
            var myIoSocket = io.connect( host, { query: "host="+window.location.host });



        myIoSocket.on('debug', function(msg){
           console.log(msg)
        });
        var mySocket = socketFactory({
            ioSocket: myIoSocket
        });
        return mySocket;
    }).run(['userFactory', '$state', '$rootScope', function (userFactory, $state, $rootScope) {
        moment.locale('ru');


        $rootScope.$watch(function () {
            return $state.current
        }, function (value) {
            if (value == undefined) {
                return;
            }
            userFactory.getAuthUser().then(function (user) {

            });
        }, true);

    }]).filter('cut', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    //Also remove . and , so its gives a cleaner result.
                    if (value.charAt(lastspace - 1) == '.' || value.charAt(lastspace - 1) == ',') {
                        lastspace = lastspace - 1;
                    }
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    }).filter('to_trusted', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }])

})(angular, window);

window.onload = function () {
    rangy.init();
}


