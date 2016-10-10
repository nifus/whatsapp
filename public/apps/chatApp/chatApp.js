(function (angular, window) {
    'use strict';
    angular.module('chatApp', ['ui.router', 'satellizer', 'core', 'ngCookies', 'naif.base64', 'cfp.hotkeys', 'luegg.directives', 'ckeditor', 'ngSanitize', 'btford.socket-io', 'ngAudio', 'ngScrollbars']).config(function ($stateProvider, $urlRouterProvider, $authProvider) {


        window.SERVER = 'http://' + window.location.host;


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
        var myIoSocket = io.connect(window.SERVER + ':3000');
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
    }]).directive('contenteditable', ['$sce', '$filter', '$timeout', function ($sce, $filter, $timeout) {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs, ngModel) {


                function read() {
                    ngModel.$setViewValue(element.html());
                }

                ngModel.$render = function () {
                    element.html($sce.getTrustedHtml(ngModel.$viewValue || ""));
                };

                element.bind("blur keyup change", function () {
                    scope.$apply(read);
                });
            }
        };
    }]);

})(angular, window);

//var saveSelection, restoreSelection;
window.onload = function () {
    rangy.init();
}
/*
 var socket = io('http://192.168.1.7:3002');

 socket.on('reload', function(msg){
 alert(msg)
 console.log(msg)
 });*/

