(function (angular) {
    'use strict';

    function scrollLoadMessagesDirective($rootScope) {
        return {
            restrict: 'A',
            //controller: scrollLoadMessagesDirective,
            link: scrollLoadMessagesLink,

        };

        scrollLoadMessagesDirective.$inject = ['$scope', '$state', 'userFactory', 'chatFactory','$q'];

        function scrollLoadMessagesLink($scope,element) {
            var last =   0;

            element.bind("scroll", function() {
                var value = element.scrollTop();
                var last_element = element.find('div.last');

                    //  add class to end element
                var bottom = element[0].scrollHeight - element[0].clientHeight;
                if ( value<bottom-30 ){
                    last_element.addClass('scroll')
                }else{
                    last_element.removeClass('scroll')
                }



                if (value<10  && value<last ){
                    $rootScope.$broadcast('scroll_up');
                }

                if (value==(element[0].scrollHeight - element[0].clientHeight) ){
                    $rootScope.$broadcast('scroll_down');
                }
                last =  element.scrollTop();
            });

        }



    }

    angular.module('chatApp').directive('scrollLoadMessages', scrollLoadMessagesDirective);


})(window.angular);
