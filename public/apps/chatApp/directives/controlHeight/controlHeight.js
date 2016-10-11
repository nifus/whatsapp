(function (angular) {
    'use strict';

    function controlHeightDirective($rootScope, $timeout) {
        return {
            restrict: 'A',
            link: controlHeightLink

        };

        controlHeightDirective.$inject = ['$scope','$timeout'];

        function controlHeightLink($scope, element) {
            var input_element = element.find('#input');
            var center_element = element.find('#input div.center');
            var around_element = element.find('#input div.around');
            var textarea_element = element.find('div.textarea');

            var reply_element = element.find('div.reply');
            var messages = element.find('div.messages');

            $rootScope.$on('textField', function (event, options) {
                console.log('--textField--')
                resize(options);
                $timeout(function(){
                   // resize(options);
                },20)
            });


            $rootScope.$on('smiles', function (event, options) {
                console.log('--smiles--')

                resize(options);
                $timeout(function(){
                    //resize(options);
                },20)
            });

            $rootScope.$on('answer', function (event, options) {
                console.log('--answer--')

                resize(options);
                $timeout(function(){
                    //resize(options);
                },20)
            });



            function resize(options) {

                var textarea_height = textarea_element[0].offsetHeight;
                var full_height = $('div.main-chatBg')[0].offsetHeight-60;
                var smiles_height = 146;
                var input_height = $('#textbox')[0].offsetHeight+20;

                console.log('full_height-'+full_height);
                console.log('input_height-'+input_height);

                input_element.height(textarea_height + 2);
                around_element.height(textarea_height + 2);
                center_element.height(textarea_height + 2);


                var reply_height = reply_element[0].offsetHeight;
                var set_message = full_height - input_height;
                var set_input = textarea_height + 2;

                if (options.smiles == true) {
                    console.log('smile');
                    set_message -= smiles_height;
                    set_input += smiles_height;
                }
                if (options.answer == true) {
                    console.log('answer');

                    set_message -= (reply_height + 20);
                    set_input += (reply_height + 20);
                }

                console.log('messages-'+set_message);
                console.log('input-'+set_input);
                console.log('=================-');
                console.log('=================-');
                console.log('=================-');

                messages.height(set_message);
                input_element.height(set_input);

            }


        }


    }

    angular.module('chatApp').directive('controlHeight', controlHeightDirective);


})(window.angular);
