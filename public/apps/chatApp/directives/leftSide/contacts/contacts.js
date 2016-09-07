(function (angular) {
    'use strict';

    angular.module('chatApp').
    controller('contactsController', contactsController);

    contactsController.$inject = ['$scope', 'userFactory', '$state'];
    function contactsController($scope, userFactory, $state) {
        $scope.env = {
            chat: undefined,
            search_activated: false
        };

        $scope.$watch('contact_list', function(value){
            if (value==true){
                $scope.showContactList();
                $scope.contact_list = false;
            }
        })

        $scope.$watch('user.contacts', function(value){
            if (value){
                    $scope.env.contacts = value;
                    $scope.env.source_contacts = value;
            }
        });
        $scope.$watch('user.chats', function(value){
            if (value){
                $scope.env.chats = value;
                $scope.env.source_chats = value;

            }
        });

        $scope.showContactList = function(value){
            if ( value!=undefined ){
                value = value.toLowerCase();
                if ($scope.env.chat!=''){
                    $scope.env.search_activated = true;
                    $scope.env.chats = $scope.env.source_chats.filter( function(chat){
                        if ( chat.name.toLowerCase().indexOf(value)!=-1){
                            return true;
                        }
                        if ( chat.login.toLowerCase().indexOf(value)!=-1){
                            return true;
                        }
                        return false;
                    });
                    $scope.env.contacts = $scope.env.source_contacts.filter( function(contact){
                        if ( contact.name.toLowerCase().indexOf(value)!=-1){
                            return true;
                        }
                        if ( contact.login.toLowerCase().indexOf(value)!=-1){
                            return true;
                        }
                        return false;
                    })
                }else{
                    $scope.env.search_activated = false;
                    $scope.env.contacts = $scope.env.source_contacts;
                    $scope.env.chats = $scope.env.source_chats;
                }
            }else{
                $scope.env.search_activated = true;
                $scope.env.contacts = $scope.env.source_contacts;
                $scope.env.chats = [];
            }

            //console.log($scope.env.chat)
        }

        $scope.$watch('env.chat', function(value){
            if (value!=undefined){
                $scope.showContactList(value)
            }

        })


    }
})(angular);