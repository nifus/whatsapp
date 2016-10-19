var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var client_host = null;
io.use(function(socket, next) {
    var handshakeData = socket.request;
    client_host = handshakeData._query['host']
    console.log("middleware:", handshakeData._query['foo']);
    next();
});


var rooms = [
    'subriz.com',
    'supportim.org',
    'flowemt.com',
    'dikom.org',
    'bitcradle.com',
    'chat.dev',
    'chat.bunzya.ru'
];


var connected = {};

function findUser(user) {
    for (var i in connected) {
        if (connected[i].user == user) {
            return true;
        }
    }
    return false;
}

io.on('connection', function (socket) {

    console.log('user connected +'+client_host)
    //console.log('a user connected');
    socket.join(client_host);

    socket.in(client_host).emit('connect');

    //  клиент отключился, по его ID исключаем его из массива
    socket.on('disconnect', function (value) {
        socket.leave(client_host);
        console.log('user disconnected');
        connected = connected.filter(function (rec) {
            if (rec.socket != socket.id) {
                return true;
            }
            return false;
        });
        //  оповещаем всех что изменился список
        socket.broadcast.emit('who_is_online', connected);
        //console.log(socket.id)
    });


    //  новое сообщение
    socket.on('message', function (obj) {
        console.log('message ' + obj.post_id + ' to chat ' + obj.chat_id);
        socket.in(client_host).broadcast.emit('reload', obj);
    });

    //  Новый чат
    socket.on('chat', function (chat, users) {
        console.log('create_chat ');
        console.log(chat);
        console.log(users);
        socket.in(client_host).broadcast.emit('create_chat', {chat: chat, users: users});
    });

    // чтение сообщений в чате
    socket.on('client:read_chat', function (chat_id) {
        console.log('read chat ' + chat_id);
        socket.in(client_host).broadcast.emit('server:read_chat', chat_id);
    });

    // клиент залогинился
    socket.on('client:signin', function (user_id) {
        // console.log('user sign in  '+user_id);
        socket.broadcast.emit('server:signin', user_id);
    });

    //  клиент сообщает свой ID
    // сервер в ответ рассказывает ему кто сейчас в сети
    socket.on('client:connect', function (user_id) {
        if (!findUser(user_id)) {
            connected[client_host].push({user: user_id, socket: socket.id});
        }
        io.sockets.emit('who_is_online', connected[client_host]);
    });


});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
