(function (angular, window) {
    'use strict';
    angular.module('chatApp', ['ui.router', 'satellizer', 'core', 'ngCookies', 'naif.base64', 'cfp.hotkeys', 'luegg.directives', 'ckeditor','ngSanitize']).config(function ($stateProvider, $urlRouterProvider, $authProvider) {


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
                if (!ngModel) return; // do nothing if no ng-model

                // Specify how UI should be updated
                ngModel.$render = function () {
                    element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                };
                scope.$watch(function(){return ngModel.$viewValue}, function(value){
                    console.log(value)
                });

                // Listen for change events to enable binding
                element.on('blur keyup change', function () {
                    scope.$evalAsync(read);
                });
                read(); // initialize

                // Write data to the model
                function read() {
                    var html = element.html();
                    // When we clear the content editable the browser leaves a <br> behind
                    // If strip-br attribute is provided then we strip this out
                    if (attrs.stripBr && html == '<br>') {
                        html = '';
                    }


                    //var savedSelection = rangy.saveSelection();
                    //if (savedSelection == null) {
                    //    return;
                    //}
                    ngModel.$setViewValue(html);
                    //Timeout is necessary as it gives time for dom to refresh

                    $timeout(function () {

                          //  rangy.restoreSelection(savedSelection);  //Rangy restore selection

                    }, 0);

                }
            }
        };
    }]);

})(angular, window);

//var saveSelection, restoreSelection;
window.onload = function () {
    rangy.init();
}
/*
 if (window.getSelection && document.createRange) {

 saveSelection = function(containerEl) {
 if (containerEl==null){
 //  return null;
 }
 //console.log(window.getSelection().getRangeAt(0))
 if ( window.getSelection().rangeCount!=0){
 var range = window.getSelection().getRangeAt(0);
 var preSelectionRange = range.cloneRange();
 preSelectionRange.selectNodeContents(containerEl);
 preSelectionRange.setEnd(range.startContainer, range.startOffset);
 var start = preSelectionRange.toString().length;

 return {
 start: start,
 end: start + range.toString().length
 }
 }
 };

 restoreSelection = function(containerEl, savedSel) {
 var charIndex = 0, range = document.createRange();
 range.setStart(containerEl, 0);
 range.collapse(true);
 var nodeStack = [containerEl], node, foundStart = false, stop = false;

 while (!stop && (node = nodeStack.pop())) {
 if (node.nodeType == 3) {
 var nextCharIndex = charIndex + node.length;
 if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
 range.setStart(node, savedSel.start - charIndex);
 foundStart = true;
 }
 if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
 range.setEnd(node, savedSel.end - charIndex);
 stop = true;
 }
 charIndex = nextCharIndex;
 } else {
 var i = node.childNodes.length;
 while (i--) {
 nodeStack.push(node.childNodes[i]);
 }
 }
 }

 var sel = window.getSelection();
 sel.removeAllRanges();
 sel.addRange(range);
 }
 } else if (document.selection) {
 saveSelection = function(containerEl) {
 var selectedTextRange = document.selection.createRange();
 var preSelectionTextRange = document.body.createTextRange();
 preSelectionTextRange.moveToElementText(containerEl);
 preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
 var start = preSelectionTextRange.text.length;

 return {
 start: start,
 end: start + selectedTextRange.text.length
 }
 };

 restoreSelection = function(containerEl, savedSel) {
 var textRange = document.body.createTextRange();
 textRange.moveToElementText(containerEl);
 textRange.collapse(true);
 textRange.moveEnd("character", savedSel.end);
 textRange.moveStart("character", savedSel.start);
 textRange.select();
 };
 }
 */