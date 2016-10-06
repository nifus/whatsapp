(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('configFactory', configFactory);
    configFactory.$inject = [ '$http', 'cacheService'];

    function configFactory($http, cacheService) {

        return {
            update:update,
            get:get,
        };

        function update(configs){
            var cache  = cacheService(
                function(){
                    $http.put('/backend/config', configs).success(function (response) {
                        cache.end( response );
                    }).error( function(response){
                        cache.end( null );
                    })
                }
            );
            return cache.promise;
        }
        function get(){
            var cache  = cacheService(
                function(){
                    $http.get('/config.json').success(function (answer) {
                        cache.end( answer );
                    }).error(function (data, code) {
                        cache.end({success: false, error: data.error});
                    })
                }, 'config_getAll', 1
            );
            return cache.promise;
        }




    }


})(angular, window);



