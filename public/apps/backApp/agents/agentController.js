(function () {
    'use strict';
    angular.module('backApp').controller('agentController', agentController);

    agentController.$inject = ['$scope', 'agentFactory', '$q'];

    function agentController($scope, agentFactory, $q) {
        $scope.env = {
            agents: [],
            promises: []
        };

        function initPage(deferred){

            var agentsPromise = agentFactory.getAllAgent().then(function (agents) {
                $scope.env.agents = agents;
            });

            $q.all([agentsPromise]).then(function () {
                deferred.resolve();
            });

            return deferred.promise;
        }

        $scope.$parent.init.push(initPage);





    }
})();

