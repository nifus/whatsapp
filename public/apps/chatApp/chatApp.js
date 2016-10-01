(function (angular, window) {
    'use strict';
    angular.module('chatApp', ['ui.router', 'satellizer', 'core', 'ngCookies','naif.base64','cfp.hotkeys','luegg.directives']).
    config(function ($stateProvider, $urlRouterProvider, $authProvider) {

        var href = window.location.href;
        if (href.indexOf('chat.dev') == -1) {
            window.SERVER = 'http://chat.bunzya.ru';
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
    }]).directive('contenteditable', ['$sce', function($sce) {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model

                // Specify how UI should be updated
                ngModel.$render = function() {
                    element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                };

                // Listen for change events to enable binding
                element.on('blur keyup change', function() {
                    scope.$evalAsync(read);
                });
                read(); // initialize

                // Write data to the model
                function read() {
                    var html = element.html();
                    // When we clear the content editable the browser leaves a <br> behind
                    // If strip-br attribute is provided then we strip this out
                    if (attrs.stripBr && html === '<br>') {
                        html = '';
                    }
                    ngModel.$setViewValue(html);
                }
            }
        };
    }]);

})(angular, window);


