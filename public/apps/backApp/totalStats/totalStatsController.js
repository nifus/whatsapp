(function () {
    'use strict';
    angular.module('backApp').controller('totalStatsController', totalStatsController);

    totalStatsController.$inject = ['$scope', '$q', 'paymentFactory'];

    function totalStatsController($scope, $q, paymentFactory) {
        $scope.env = {
            articles: [],
            config: [],
            stat: {},
            promises:[]
        };

        function initPage(deferred){

            var paymentPromise = paymentFactory.getTotalStat().then(function (response) {
                $scope.env.stat = response;
            });
            $scope.env.promises.push(paymentPromise);

            $q.all($scope.env.promises).then(function () {
                $scope.env.config = $scope.$parent.config;
                deferred.resolve();
                console.log('stat loaded')
            });
            return deferred.promise;
        }
        $scope.$parent.init.push(initPage);


    }
})();

