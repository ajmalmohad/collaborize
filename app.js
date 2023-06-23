/**
 * Config
 */
const express = require("express");
const cors = require('cors')
const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://collaborizeproject.netlify.app'],
  methods: ["GET", "POST"]
}))
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: {
      origin: ['http://localhost:3000', 'https://collaborizeproject.netlify.app'],
      methods: ["GET", "POST"]
    }
});
require('./src/chat/chat')(io);

/**
 * Routes
 */
app.get('/',(req, res)=>{ return res.status(200).json({message:"Works!"}); })
app.use('/auth', require('./src/routes/auth.js'));
app.use('/bot', require('./src/routes/bot.js'));

server.listen(5000, () => {
  console.log(`Server started: http://localhost:5000`)
})