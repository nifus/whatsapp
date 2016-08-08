(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('configFactory', configFactory);
    configFactory.$inject = [ '$http', 'cacheService'];

    function configFactory($http, cacheService) {

        return {
            update:update,
            getAll:getAll,
            getCurrencyList:getCurrencyList
        };

        function update(configs){
            var cache  = cacheService(
                function(){
                    $http.post(window.SERVER+'/backend/config', configs).success(function (response) {
                        cache.end( response );
                    }).error( function(response){
                        cache.end( null );
                    })
                }
            );
            return cache.promise;
        }
        function getAll(){
            var cache  = cacheService(
                function(){
                    $http.get(window.SERVER+'/backend/config').success(function (answer) {
                        cache.end( answer );
                    }).error(function (data, code) {
                        cache.end({success: false, error: data.error});
                    })
                }, 'config_getAll', 1
            );
            return cache.promise;
        }
        function getCurrencyList(){
            var cache  = cacheService(
                function(){
                    $http.get(window.SERVER+'/backend/config/currency').success(function (answer) {
                        cache.end( answer );
                    }).error(function (data, code) {
                        cache.end({success: false, error: data.error});
                    })
                }, 'config_getcurrency', 1
            );
            return cache.promise;
        }



    }


})(angular, window);



