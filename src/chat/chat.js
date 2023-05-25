const { userJoined, welcomeUser, userSendMessage, sendOffUser } = require('./functions')
const { sendCurrentRoomUsers, findCurrentRoomUsers, userDisconnected } = require('./functions')

module.exports = function(io) {

    let currentRoom = '';
    let allUsers = [];
    let CHAT_BOT = "The Author";
    let CHAT_EMAIL = "admin@collaborizer.com";

    io.on('connection', (socket) => {
        console.log(`User connected ${socket.id}`);
        socket.on('join_room', (data) => {
            const { name, email, roomId } = data; 
            if (allUsers.filter(item => (item.id === socket.id && item.roomId===roomId)).length === 0) {
                socket.join(roomId); 

                if(allUsers.filter(item => (item.email===email)).length === 0){
                    userJoined(roomId, name, CHAT_EMAIL, CHAT_BOT, socket);
                }
                
                allUsers.push({ id: socket.id, name, email, roomId });
            }
            welcomeUser(name, CHAT_EMAIL, CHAT_BOT, socket);
            currentRoom = roomId;
            let currentRoomUsers = findCurrentRoomUsers(allUsers, roomId);
            sendCurrentRoomUsers(roomId, currentRoomUsers, socket, true);
        });


        userSendMessage(socket, io);

        socket.on('leave_room', (data) => {
            const { name, email, roomId } = data;
            socket.leave(roomId);
            allUsers = allUsers.filter((user) => user.id != socket.id);
            if(allUsers.filter(item => (item.email===email)).length === 0){
                let currentRoomUsers = findCurrentRoomUsers(allUsers, roomId);
                sendCurrentRoomUsers(roomId, currentRoomUsers, socket, false);
                sendOffUser(roomId, name, CHAT_EMAIL, CHAT_BOT, socket);
                console.log(`${name} has left the chat`);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from the chat');
            const user = allUsers.find((user) => user.id == socket.id);
            allUsers = allUsers.filter((user) => user.id != socket.id);
            if(user?.name && user?.email && allUsers.filter(item => (item.email===user.email)).length === 0){
              let currentRoomUsers = findCurrentRoomUsers(allUsers, currentRoom);
              socket.to(currentRoom).emit('chatroom_users', currentRoomUsers);
              userDisconnected(currentRoom, user.name, CHAT_EMAIL, CHAT_BOT, socket);
            }
        });


    });

}