(function (angular) {
    'use strict';

    function scrollLoadMessagesDirective() {
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
                if (value<10 && $scope.env.loading===false && value<last ){
                    $scope.env.loading = true;
                    $scope.$apply()
                }
                last =  element.scrollTop();
            });

        }



    }

    angular.module('chatApp').directive('scrollLoadMessages', scrollLoadMessagesDirective);


})(window.angular);
