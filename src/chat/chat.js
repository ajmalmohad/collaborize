const { userJoined, welcomeUser, userSendMessage, sendOffUser } = require('./functions')
const { sendCurrentRoomUsers, findCurrentRoomUsers, userDisconnected } = require('./functions')

module.exports = function(io) {

    let currentRoom = '';
    let allUsers = [];
    let CHAT_BOT = "The Author";

    io.on('connection', (socket) => {
        console.log(`User connected ${socket.id}`);
        socket.on('join_room', (data) => {
            const { username, room } = data; 
            socket.join(room); 
            
            userJoined(room, username, CHAT_BOT, socket);
            welcomeUser(username, CHAT_BOT, socket);

            currentRoom = room;

            allUsers.push({ id: socket.id, username, room });
            let currentRoomUsers = findCurrentRoomUsers(allUsers, room);
            sendCurrentRoomUsers(room, currentRoomUsers, socket, true);
        
        });


        userSendMessage(socket, io);

        socket.on('leave_room', (data) => {
            const { username, room } = data;
            socket.leave(room);
            allUsers = allUsers.filter((user) => user.id != socket.id);
            let currentRoomUsers = findCurrentRoomUsers(allUsers, room);
            sendCurrentRoomUsers(room, currentRoomUsers, socket, false);
            sendOffUser(room, username, CHAT_BOT, socket);
            console.log(`${username} has left the chat`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from the chat');
            const user = allUsers.find((user) => user.id == socket.id);
            if (user?.username) {
              allUsers = allUsers.filter((user) => user.id != socket.id);
              let currentRoomUsers = findCurrentRoomUsers(allUsers, currentRoom);
              socket.to(currentRoom).emit('chatroom_users', currentRoomUsers);
              userDisconnected(currentRoom, user.username, CHAT_BOT, socket);
            }
        });


    });

}