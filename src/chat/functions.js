
const userJoined = (roomId, name, email, author, socket) => {
    let __createdtime__ = Date.now();
    socket.to(roomId).emit('receive_message', {
        message: `${name} has joined the room`,
        name: author,
        email: email,
        __createdtime__,
    });
}


const welcomeUser = (name, email, author, socket) => {
    let __createdtime__ = Date.now();
    socket.emit('receive_message', {
        message: `Welcome ${name}`,
        name: author,
        email: email,
        __createdtime__,
    });
}

const sendCurrentRoomUsers = (roomId, currentRoomUsers, socket, me) => {
    socket.to(roomId).emit('chatroom_users', currentRoomUsers);
    if(me) socket.emit('chatroom_users', currentRoomUsers);
}

const findCurrentRoomUsers = (allUsers, roomId) => {
    return allUsers.filter((user) => user.roomId === roomId);
}

const userSendMessage = (socket, io) => {
    socket.on('send_message', (data) => {
        io.in(data.roomId).emit('receive_message', data); 
    });
}

const sendOffUser = (roomId, name, email, author, socket) =>  {
    let __createdtime__ = Date.now();
    socket.to(roomId).emit('receive_message', {
        name: author,
        email: email,
        message: `${name} has left the chat`,
        __createdtime__,
    });
}

const userDisconnected = (roomId, name, email, author, socket) =>  {
    let __createdtime__ = Date.now();
    socket.to(roomId).emit('receive_message', {
        name: author,
        email: email,
        message: `${name} has disconnected from the chat.`,
        __createdtime__,
    });
}

module.exports = { 
    userJoined, welcomeUser, sendCurrentRoomUsers, userDisconnected,
    findCurrentRoomUsers, userSendMessage, sendOffUser
}