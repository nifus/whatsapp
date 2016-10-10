(function (angular, window) {

    'use strict';

    angular.module('core')
        .factory('chatFactory', chatFactory);
    chatFactory.$inject = ['chatService', '$http','$q'];

    function chatFactory(chatService, $http, $q) {

        return {
            getByUser:getByUser,
            getById:getById,
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
                    if ( response.data.success==true){
                        return  {chat: new chatService(response.data.chat), success: true}
                    }else{
                        return  response.data
                    }
                }
            )

        }

        function getByUser(user_id){
            return $http.get(window.SERVER+'/backend/user/chats').then(
                function(response){
                    var result = [];
                    for(var i in response.data ){
                        result.push( new chatService(response.data[i], user_id) )
                    }
                    return result;
                }
            )
        }

        function getById(id){
            var deferred = $q.defer();
            $http.get(window.SERVER+'/chats/'+id).then(
                function(response){
                    deferred.resolve(new chatService(response.data));
                },
                function(error){
                    console.log(error);
                    deferred.reject({success: false, error: error.data});

                }
            );

            return deferred.promise;
        }


    }


})(angular, window);



