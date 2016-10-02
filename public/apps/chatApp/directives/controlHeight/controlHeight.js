(function (angular) {
    'use strict';

    function controlHeightDirective($rootScope) {
        return {
            restrict: 'A',
            controller: controlHeightDirective,
            link: controlHeightLink,

        };

        controlHeightDirective.$inject = ['$scope'];

        function controlHeightLink($scope,element) {
            var input_element = element.find('#input');
            var center_element = element.find('#input div.center');
            var around_element = element.find('#input div.around');
            var textarea_element = element.find('div.textarea');

            var smiles_element = element.find('div.smiles');
            var messages = element.find('div.messages');


            $rootScope.$on('textField', function (event, options) {
                resize(options)

            });


            $rootScope.$on('smiles', function (event, options) {
                resize(options)
            });

            $( window ).resize(function() {
                resize({})
            });

            function resize(options) {
                var textarea_height = textarea_element[0].offsetHeight;
                input_element.height(textarea_height+2);
                around_element.height(textarea_height+2);
                center_element.height(textarea_height+2);

                var full_height = element[0].offsetHeight;
                var smiles_height = smiles_element[0].offsetHeight;
                var input_height = input_element[0].offsetHeight;


                if (options.smiles==true){
                    messages.height(full_height-input_height-smiles_height);
                    input_element.height(textarea_height+2+smiles_height);
                    //around_element.height(textarea_height+2+smiles_height);

                }else{
                    messages.height(full_height-input_height);
                }

            }






        }
        function controlHeightDirective($scope, $state, userFactory, chatFactory,$q) {


        }


    }

    angular.module('chatApp').directive('controlHeight', controlHeightDirective);


})(window.angular);
