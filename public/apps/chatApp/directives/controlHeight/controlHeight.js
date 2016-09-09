(function (angular) {
    'use strict';

    function controlHeightDirective() {
        return {
            restrict: 'A',
            controller: controlHeightDirective,
            link: controlHeightLink,

        };

        controlHeightDirective.$inject = ['$scope', '$state', 'userFactory', 'chatFactory','$q'];

        function controlHeightLink($scope,element) {
            var reply_element = element.find('div.reply');
            var messages_element = element.find('div.messages');
            //var elements = element.find('ul.post-menu');
            $scope.$watch(function(){
                return reply_element[0].clientHeight;
            },styleChangeFn);

            function styleChangeFn(value,old){
                console.log(value)
                if (value>0){
                    console.log('less')
                   // messages_element.clientHeight = 100
                    messages_element.height('81%') //= '100px'
                }else{
                    console.log('more')

                    messages_element.height('87%')
                }
            }
        }
        function controlHeightDirective($scope, $state, userFactory, chatFactory,$q) {


        }


    }

    angular.module('chatApp').directive('controlHeight', controlHeightDirective);


})(window.angular);
