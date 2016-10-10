(function (angular) {
    'use strict';

    function scrollLoadMessagesDirective($rootScope, $timeout) {
        return {
            restrict: 'A',
            //controller: scrollLoadMessagesDirective,
            link: scrollLoadMessagesLink,

        };

        scrollLoadMessagesDirective.$inject = ['$scope','$timeout'];

        function scrollLoadMessagesLink($scope,element) {
            var last =   0;

                //  нужно промотать к заданному элементу
            $rootScope.$on('messages:scroll_to', function(e, value){
                $('#post-'+value).ready(function () {
                    $('div.messages').scrollTo('#post-'+value);
                });
            });

                //  нужно промотать в самый низ
            $rootScope.$on('messages:scroll_down', function(value, last_post_id){
                $('#post-'+last_post_id).ready(function () {
                    element.scrollTop(element[0].scrollHeight);
                    $('div.messages').scrollTo('#post-'+last_post_id);
                    $timeout(function(){
                        $('div.messages').scrollTo('#post-'+last_post_id);
                    },20)
                })
            });

                //  мониторим скроллинг
            element.bind("scroll", function() {
                var value = element.scrollTop();

                    //  add class to end element
                class2last_element(value);


                    //  в вверхней позиции
                if (value<10  && value<last ){
                    $rootScope.$broadcast('messages:scroll_top');
                }

                if (value==(element[0].scrollHeight - element[0].clientHeight) ){
                    $rootScope.$broadcast('scroll_down');
                }
                last =  element.scrollTop();
            });

            function class2last_element(value) {
                var last_element = element.find('div.last');
                var bottom = element[0].scrollHeight - element[0].clientHeight;
                if ( value<bottom-30 ){
                    last_element.addClass('scroll')
                }else{
                    last_element.removeClass('scroll')
                }
            }

        }



    }

    angular.module('chatApp').directive('scrollLoadMessages', scrollLoadMessagesDirective);


})(window.angular);
