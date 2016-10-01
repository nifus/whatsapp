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
            var input_element = element.find('div.textarea');
            var smiles_element = element.find('div.smiles');
            var messages = element.find('div.messages');


            $rootScope.$on('textField', function (event, options) {
                resize(options)

            });


            $rootScope.$on('smiles', function (event, options) {
                resize(options)
            });


            function resize(options) {
                var full_height = element[0].offsetHeight;
                var input_height = input_element[0].offsetHeight;
                var smiles_height = smiles_element[0].offsetHeight;


                if (options.smiles==true){
                    messages.height(full_height-input_height-17-smiles_height);
                }else{
                    messages.height(full_height-input_height-17);

                }
                console.log('full - '+full_height);
                console.log('smiles - '+smiles_height);
                console.log('input - '+input_height);
                console.log('result - '+(full_height-input_height) );
                console.log('----')
                // console.log();
                // console.log(input_element[0].scrollHeight);
                //console.log(input_element[0].offsetHeight);
            }






        }
        function controlHeightDirective($scope, $state, userFactory, chatFactory,$q) {


        }


    }

    angular.module('chatApp').directive('controlHeight', controlHeightDirective);


})(window.angular);
