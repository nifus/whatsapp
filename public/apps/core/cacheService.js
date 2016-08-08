(function (angular) {

    'use strict';

    angular.module('core')
        .factory('cacheService', cacheService);
    cacheService.$inject = ['$q'];

    function cacheService($q) {

        var cache = {};


        return function (action, key, time) {
            time = time!=undefined ? time : 0;
            var nowUnixTime = parseInt(new Date().getTime()/1000);
            var cacheObject = {
                deferred: $q.defer()
            };
            cacheObject.promise = cacheObject.deferred.promise;

            if ( cache[key]==undefined ){
                cache[key] = {
                    create_time: parseInt(new Date().getTime()/1000),
                    send: false,
                    result: undefined,
                    queue: []
                }
            }


            if( cache[key].send==false ){
                if ( cache[key].result!=undefined && (  nowUnixTime<cache[key].create_time+time) ) {
                    cacheObject.deferred.resolve(cache[key].result);
                }else{
                    cache[key].queue.push( cacheObject.deferred );
                    cache[key].send = true;
                    action(); //run action
                }
            }else{
                cache[key].queue.push( cacheObject.deferred )
            }

            cacheObject.end = function(response){

                cache[key].send = false;
                cache[key].result = response;
                for( var i in cache[key].queue ){
                    cache[key].queue[i].resolve(cache[key].result);
                }
            };

            return cacheObject;
        }

    }


})(angular);



