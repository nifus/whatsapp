(function (angular) {
    'use strict';

    angular.module('chatApp').
    controller('contactsController', contactsController);

    contactsController.$inject = ['$scope', 'userFactory', '$state'];
    function contactsController($scope, userFactory, $state) {
        var $promises = [];
        $scope.env = {
            chat: '',
            chats:[],
            contacts:[],
            search_activated: false

        };



        $scope.$watch('user', function(value){
            if (value){
                $promises.push( $scope.user.getAllContacts().then(function (contacts) {
                    $scope.env.contacts = contacts;
                    $scope.env.source_contacts = contacts;
                }) );
                $promises.push( $scope.user.getAllChats().then(function (chats) {
                    $scope.env.chats = chats;
                    $scope.env.source_chats = chats;
                }) );
            }
        });

        $scope.$watch('env.chat', function(value){
            if ($scope.env.chat!=''){
                $scope.env.search_activated = true;
                $scope.env.chats = $scope.env.source_chats.filter( function(chat){
                    if ( chat.name.toLowerCase().indexOf(value)!=-1){
                        return true;
                    }
                    return false;
                });
                $scope.env.contacts = $scope.env.source_contacts.filter( function(contact){
                    if ( contact.name.toLowerCase().indexOf(value)!=-1){
                        return true;
                    }
                    return false;
                })
            }else{
                $scope.env.search_activated = false;
                $scope.env.contacts = $scope.env.source_contacts;
                $scope.env.chats = $scope.env.source_chats;
            }

            console.log($scope.env.chat)
        })


    }
})(angular);