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
            var reply_element = element.find('div.reply');
            var messages = element.find('div.messages');


            $rootScope.$on('textField', function (event, options) {
                resize(options)
            });


            $rootScope.$on('smiles', function (event, options) {
                resize(options)
            });

            $rootScope.$on('answer', function (event, options) {
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
                var smiles_height = (smiles_element[0].offsetHeight>0 ? smiles_element[0].offsetHeight+20 : smiles_element[0].offsetHeight) ;
                var reply_height = reply_element[0].offsetHeight;
                var input_height = input_element[0].offsetHeight;

                var set_message = full_height-input_height;
                var set_input =textarea_height+2;

                if (options.smiles==true){
                    console.log('smile=true')
                    set_message-=smiles_height;
                    set_input+=smiles_height;
                }
                if (options.answer==true){
                    console.log('answer=true')
                    console.log(reply_height)

                    set_message-=(reply_height+20);
                    set_input+=(reply_height+20);
                }

                messages.height(set_message);
                input_element.height(set_input);

            }






        }
        function controlHeightDirective($scope, $state, userFactory, chatFactory,$q) {


        }


    }

    angular.module('chatApp').directive('controlHeight', controlHeightDirective);


})(window.angular);
