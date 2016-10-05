(function () {

    'use strict';

    angular
        .module('chatApp')
        .controller('configController', configController);

    configController.$inject = ['$scope',  'configFactory'];

    function configController($scope, configFactory) {


        function initPage(deferred) {
            $scope.config = $scope.$parent.env.config;
            return deferred.promise;
        }

        // initPage();
        $scope.$parent.init.push(initPage);





        $scope.save = function (data) {
            configFactory.update(data).then(function (response) {
                if (response.success == false) {
                    alertify.error(response.error);
                } else {
                    alertify.success('Настройки изменены');
                }
            })
        };



        $scope.logout = function(){
            userFactory.logout();
            window.location.href='/'
        }

    }

})();