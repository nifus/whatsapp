(function (angular) {
    'use strict';

    angular.module('chatApp').controller('contactsController', contactsController);

    contactsController.$inject = ['$scope', 'userFactory', '$http'];
    function contactsController($scope, userFactory, $http) {
        $scope.env = {
            chat: undefined,
            search_activated: false,
            search_result: []
        };

        $scope.$watch('contact_list', function (value) {
            if (value == true) {
                $scope.showContactList();
                //$scope.contact_list = false;
            } else {
                $scope.hideContactList();
            }
        });

        $scope.$watch('user.contacts', function (value) {
            if (value) {
                $scope.env.contacts = value;
                $scope.env.source_contacts = value;
            }
        });
        $scope.$watch('user.chats', function (value) {


            if (value) {
                $scope.env.chats = value;
                $scope.env.source_chats = value;
            }
        });

        $scope.hideContactList = function () {
            $scope.env.search_activated = false;
            $scope.env.chats = $scope.env.source_chats;
        };

        $scope.showContactList = function (value) {
            if (value != undefined) {
                value = value.toLowerCase();
                if ($scope.env.chat != '') {
                    $scope.env.search_activated = true;

                    $scope.env.chats = $scope.env.source_chats.filter(function (chat) {
                        if (chat.current_name.toLowerCase().indexOf(value) != -1) {
                            return true;
                        }

                        if (chat.login != undefined && chat.login.toLowerCase().indexOf(value) != -1) {
                            return true;
                        }
                        return false;
                    });
                    $scope.env.contacts = $scope.env.source_contacts.filter(function (contact) {
                        if (contact.name.toLowerCase().indexOf(value) != -1) {
                            return true;
                        }
                        if (contact.login != undefined && contact.login.toLowerCase().indexOf(value) != -1) {
                            return true;
                        }
                        return false;
                    })
                } else {
                    $scope.env.search_activated = false;
                    $scope.env.contacts = $scope.env.source_contacts;
                    $scope.env.chats = $scope.env.source_chats;
                }
            } else {
                $scope.env.search_activated = true;
                $scope.env.contacts = $scope.env.source_contacts;
                $scope.env.chats = [];
            }

            //console.log($scope.env.chat)
        };

        function search(value) {
            if (value.length < 2) {
                $scope.env.search_result = [];
                return;
            }
            $http.get('/chats/search/' + value).success(function (result) {
                $scope.env.search_result = result.post;
                var reg = new RegExp('(.{0,50})'+"(" + value + ")" + '(.{0,50})');
                for (var i in result.post) {
                    var message = strip(result.post[i].message);
                    message = message.match(reg);
                    result.post[i].message =  message[1] +'<strong>' + message[2] + '</strong>' + message[3]
                }
            })
        }

        $scope.$watch('env.chat', function (value) {
            if (value != undefined) {
                $scope.showContactList(value);
                search(value);
            }

        });

        function strip(html)
        {
            return html.replace(/<(?:.|\n)*?>/gm, '');
        }


    }
})(angular);