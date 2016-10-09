var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



io.on('connection', function(socket){
    //console.log('a user connected');
    //socket.broadcast.emit('reload',{ chat: 'privet' });
    //socket.emit('reload',{ chat: 'privet' });

    socket.on('disconnect', function(){
       // console.log('user disconnected');
    });

    socket.on('message', function(chat){
        //console.log('message '+chat);
       // io.emit('some event', { chat: chat });
        socket.broadcast.emit('reload',{ chat: chat });
      //  socket.emit('reload',{ chat: chat });

    });
});

http.listen(3002, function(){
    //console.log('listening on *:3001');
});