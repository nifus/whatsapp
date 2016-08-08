(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('chatFactory', chatFactory);
    chatFactory.$inject = ['chatService', '$http',  'cacheService','$q'];

    function chatFactory(chatService, $http, cacheService, $q) {

        return {
            getAll:getAll
        };




        /**
         * Get chatService with current chat
         * @returns promise
         */
        function getAll(){
            var cache  = cacheService(
                function(){
                    $http.get(window.SERVER+'/public/data/chats.json').success( function(response){
                        var result= [];
                        var promises = [];
                        for(var i in response){
                            promises.push(chatService(response[i]).then(function(obj){
                                result.push( obj );
                            }))
                        }
                        $q.all(promises).then(function(){
                            cache.end( result );
                        })

                    }).error( function(response){
                        cache.end( null );
                    })
                }, 'chat_get_all_chats', 20
            );
            return cache.promise;
        }


    }


})(angular, window);



