
const userJoined = (room, username, author, socket) => {
    let __createdtime__ = Date.now();
    socket.to(room).emit('receive_message', {
        message: `${username} has joined the room`,
        username: author,
        __createdtime__,
    });
}


const welcomeUser = (username, author, socket) => {
    let __createdtime__ = Date.now();
    socket.emit('receive_message', {
        message: `Welcome ${username}`,
        username: author,
        __createdtime__,
    });
}

const sendCurrentRoomUsers = (room, currentRoomUsers, socket, me) => {
    socket.to(room).emit('chatroom_users', currentRoomUsers);
    if(me) socket.emit('chatroom_users', currentRoomUsers);
}

const findCurrentRoomUsers = (allUsers, room) => {
    return allUsers.filter((user) => user.room === room);
}

const userSendMessage = (socket, io) => {
    socket.on('send_message', (data) => {
        io.in(data.room).emit('receive_message', data); 
    });
}

const sendOffUser = (room, username, author, socket) =>  {
    let __createdtime__ = Date.now();
    socket.to(room).emit('receive_message', {
        username: author,
        message: `${username} has left the chat`,
        __createdtime__,
    });
}

const userDisconnected = (room, username, author, socket) =>  {
    let __createdtime__ = Date.now();
    socket.to(room).emit('receive_message', {
        username: author,
        message: `${username} has disconnected from the chat.`,
        __createdtime__,
    });
}

module.exports = { 
    userJoined, welcomeUser, sendCurrentRoomUsers, userDisconnected,
    findCurrentRoomUsers, userSendMessage, sendOffUser
}