require('dotenv').config()
const express = require("express");
const router = express.Router();

/**
 * Chatting Routes
*/
router.get('/',(req,res)=>{
    return res.status(200).json({message:"Chatting Route"});
})


module.exports = router;