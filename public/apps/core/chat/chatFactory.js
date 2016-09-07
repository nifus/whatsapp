(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('chatFactory', chatFactory);
    chatFactory.$inject = ['chatService', '$http'];

    function chatFactory(chatService, $http) {

        return {
            getByUser:getByUser,
            createByContact: createByContact,
            createGroup: createGroup
        };

        function createGroup(data) {

            var contact_ids = [];
            for( var i in data['contacts']){
                contact_ids.push( data['contacts'][i].id)
            }
            data['contacts'] = contact_ids;
            return $http.post(window.SERVER+'/chats/group',data).then(
                function(response){
                    if (response.data.success==true){
                        return  {success:true,chat: new chatService(response.data.chat ) }
                    }else{
                        return  {success:false,error: response.data.error }
                    }
                }
            )

        }
        function createByContact(author,contact) {
            return $http.post(window.SERVER+'/chats',{members:[contact.id]}).then(
                function(response){
                    return  new chatService(response.data.chat )
                }
            )

        }

        function getByUser(){
            return $http.get(window.SERVER+'/backend/user/chats').then(
                function(response){
                    var result = [];
                    for(var i in response.data ){
                        result.push( new chatService(response.data[i]) )
                    }
                    return result;
                }
            )
        }


    }


})(angular, window);



