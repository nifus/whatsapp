(function (angular, window) {
    'use strict';
    angular.module('frontApp', ['core','ngCookies'])
        .config(function (/*$authProvider, $interpolateProvider*/) {
            //$interpolateProvider.startSymbol('{').endSymbol('}');
            var href = window.location.href;

            if ( href.indexOf('chat.dev')==-1 ){
                window.SERVER = 'http://bitfin.org';
            }else{
                window.SERVER = 'http://chat.dev';
            }

            //$authProvider.httpInterceptor = false;
           // $authProvider.loginUrl = window.SERVER+'/backend/user/authenticate';
           // $authProvider.signupUrl = window.SERVER+'/backend/user/register';
        })
})(angular, window);


