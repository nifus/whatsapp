var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



io.on('connection', function(socket){
    console.log('a user connected');


    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

        //  новое сообщение
    socket.on('message', function(obj){
        console.log('message '+obj.post_id+' to chat '+obj.chat_id);
        socket.broadcast.emit('reload',obj);
    });

        //  Новый чат
    socket.on('chat', function(chat, users){
        console.log('create_chat ');
        console.log(chat);
        console.log(users);
        socket.broadcast.emit('create_chat',{ chat: chat, users:users });
    });

        // чтение сообщений в чате
    socket.on('client:read_chat', function(chat_id){
        console.log('read chat '+chat_id);
        socket.broadcast.emit('server:read_chat',chat_id);
    });

        // клиент залогинился
    socket.on('client:signin', function(user_id){
        console.log('user sign in  '+user_id);
        socket.broadcast.emit('server:signin',user_id);
    });



});

http.listen(3000, function(){
    console.log('listening on *:3000');
});