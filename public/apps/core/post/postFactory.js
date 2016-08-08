(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('postFactory', postFactory);
    postFactory.$inject = ['postService', '$http',  'cacheService','$q'];

    function postFactory(postService, $http, cacheService, $q) {

        return {
           // getAll:getAll,
            getById:getById,
           // getByChatId:getByChatId
        };


        function getById(id){
            var cache  = cacheService(
                function(){
                    $http.get(window.SERVER+'/public/data/post.json').success( function(response){
                        var result= null;
                        var promises = [];
                        for(var i in response){
                            if ( response[i].id==id){
                                promises.push(postService(response[i]).then(function(obj){
                                    result = ( obj );
                                }))
                            }

                        }
                        $q.all(promises).then(function(){
                            cache.end( result );
                        })

                    }).error( function(response){
                        cache.end( null );
                    })
                }, 'post_get_all_posts', 20
            );
            return cache.promise;
        }

        /**
         * Get postService with current post
         * @returns promise
         */
        /*function getAll(){
            var cache  = cacheService(
                function(){
                    $http.get(window.SERVER+'/public/data/posts.json').success( function(response){
                        var result= [];
                        var promises = [];
                        for(var i in response){
                            promises.push(postService(response[i]).then(function(obj){
                                result.push( obj );
                            }))
                        }
                        $q.all(promises).then(function(){
                            cache.end( result );
                        })

                    }).error( function(response){
                        cache.end( null );
                    })
                }, 'post_get_all_posts', 20
            );
            return cache.promise;
        }*/


    }


})(angular, window);



