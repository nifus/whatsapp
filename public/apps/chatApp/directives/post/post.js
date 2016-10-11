(function (angular) {
    'use strict';

    function postDirective($rootScope) {
        return {
            replace: true,
            restrict: 'E',
            controller: postDirective,
            link: postLink,
            templateUrl: 'apps/chatApp/directives/post/post.html',
            scope: {
                post:'=',
                user:'=',
                isSelectPost:'=',
                isEditPost:'=',
                isLastPost:'='
            }
        };

        postDirective.$inject = ['$scope', '$state', 'userFactory', 'chatFactory','$q'];

        function postLink($scope,element) {

            var elements = element.find('ul.post-menu');

            element.bind('mouseover', function(){
                element.find('li.dd-menu').css('display','inline');
                element.find('li.time').css('visibility','hidden');
                element.find('li.status').css('display','none');
            })

            element.bind('mouseout', function(){
                element.find('li.dd-menu').css('display','none');
                element.find('li.time').css('visibility','visible')
                element.find('li.status').css('display','inline');

            })
        }
        function postDirective($scope, $state, userFactory, chatFactory,$q) {


            $scope.remove = function(){
                alertify.confirm("Удалить сообщение?", function (e) {
                    if (e) {
                        $scope.post.remove().then(function(response){
                            if (response.success==1){
                                $scope.post.is_deleted='1';
                                alertify.success("Сообщение удалено");
                                $rootScope.$broadcast('delete',{} );
                            }else{
                                alertify.error("Сообщение не удалено");
                            }
                        });
                        $scope.$apply();

                    }
                });
            };

            $scope.edit = function(){
                $scope.isEditPost = $scope.post;
            };

            $scope.replyToMessage = function(){
                $scope.isSelectPost = $scope.post;
                $rootScope.$broadcast('reply',{'post':$scope.post} );

            }
        }


    }

    angular.module('chatApp').directive('post', postDirective);


})(window.angular);
