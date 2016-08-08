(function () {
    'use strict';
    angular.module('backApp').controller('paymentsSearchListController', paymentsSearchListController);

    paymentsSearchListController.$inject = ['$scope','$state'];

    function paymentsSearchListController($scope,$state) {

        $scope.env = {
            loading: false,
            filters: $state.params
        };



    }
})();

