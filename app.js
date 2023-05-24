/**
 * Config
 */
const express = require("express");
const cors = require('cors')
const app = express();
app.use(express.json());
app.use(cors())

/**
 * Routes
 */
app.get('/',(req, res)=>{ return res.status(200).json({message:"Works!"}); })
app.use('/auth', require('./src/routes/auth.js'));
app.listen(5000);