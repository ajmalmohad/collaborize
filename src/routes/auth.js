require('dotenv').config()
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../models/User');
const Session = require('../models/Session');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const { Sequelize } = require('sequelize');
const { encrypt, decrypt } = require('./../encrypt/encrypt');

/**
 * Database
 */
const db = require('../database/database.js');

User.hasMany(Session, { foreignKey: 'ownerId' });
Session.belongsTo(User, { foreignKey: 'ownerId' });

db.sync({force: true})
    .then((result)=>{
        console.log("Tables Created!");
    })
    .catch((error)=>{
        console.log("Error: ",error);
    })


/**
 * Utilities
 */
function createAccessToken(user){
    return jwt.sign(parseUser(user), process.env.ACCESS_TOKEN_SECRET, {expiresIn: '5m'});
}

function createRefreshToken(user){
    return jwt.sign(parseUser(user), process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
}

function parseUser(user){
    return { userId:user.userId };
}

function deSensitize(user){
    return {
        userId: user.userId,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified
    }
}

function populateUser(user){
    let populated = {
        userId: crypto.randomBytes(16).toString("hex"),
        name: user.name,
        email: user.email,
        password: user.password,
        emailVerified: false,
    }
    return populated;
}

function createNewSession(refreshToken, userId){
    let session = {
        refreshToken: refreshToken,
        ownerId: userId
    }
    Session.findAll({ where: { ownerId: userId }, order:  [ ['updatedAt',  'ASC'] ] })
        .then(data => {
            if(data.length < 3){
                Session.create(session)
                    .then(data => {
                        console.log("New Session Created!");
                    })
                    .catch(err => {
                        console.log("Unexpected Error on Creating Session");
                    })
            }else{
                let allSessions = data.map(item => item.dataValues);
                Session.update({ refreshToken: refreshToken }, {
                    where: { id: allSessions[0].id }
                }).then(data => {
                    console.log("Old Session Updated to New Session!");
                })
            }
        })
        .catch(err => {
            console.log("Unexpected Error on Loading Session");
        })
}


/**
 * Authentication Routes
 */
 router.get('/',(req,res)=>{
    return res.status(200).json({message:"Authentication Route"});
})

router.post('/signup',(req,res)=>{
    const {user} = req.body;
    if(!user) return res.status(404).json({message:"User Information Not Provided"});

    User.count({ where:  Sequelize.or({ email: user.email }) })
        .then(count => {
            if (count != 0) return res.status(409).json({message:"User Already Exists"});
            
            bcrypt.hash(user.password, 8).then(function(hash) {
                user.password = hash;
                let fullUser = populateUser(user);
                User.create(fullUser)
                    .then(data=>{
                        let userData = data.dataValues;
                        let accessToken = createAccessToken(userData);
                        let refreshToken = createRefreshToken(userData);
                        createNewSession(encrypt(refreshToken), userData.userId);
                        let deSensitized = deSensitize(userData);
                        return res.status(200).json({ deSensitized, accessToken, refreshToken});
                    })
                    .catch(err => {
                        return res.status(500).json({message:"Unexpected Error on User Creation"});
                    })
            }).catch(err => {
                return res.status(500).json({message:"Unexpected Error on Encryption"});
            })
        })
        .catch(err => {
            return res.status(500).json({message:"Unexpected Error on Reading from Database"});
        })

})

router.post('/login',(req,res)=>{
    const {user} = req.body;
    if(!user) return res.status(404).json({message:"User Information Not Provided"});

    User.findOne({ where: { email: user.email } })
        .then(data => {
            if(data===null) return res.status(404).json({message:"User Do Not Exists"});
            let userData = data.dataValues;
            bcrypt.compare(user.password, userData.password).then(function(isMatch) {
                if(!isMatch) return res.status(403).json({message:"Password Not Verified"});
                let accessToken = createAccessToken(userData);
                let refreshToken = createRefreshToken(userData);
                createNewSession(encrypt(refreshToken), userData.userId);
                let deSensitized = deSensitize(userData);
                return res.status(200).json({ deSensitized, accessToken, refreshToken});
            }).catch(err => {
                return res.status(500).json({message:"Unexpected Error on Decryption"});
            })
        })
        .catch(err => {
            return res.status(500).json({message:"Unexpected Error on Reading from Database"});
        })
})

router.post("/renewAccess", (req, res)=>{
    const refreshToken = req.body.token;
    if(!refreshToken) return res.status(404).json({message:"Refresh Token Not Provided"});
    
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err,userData)=>{
        if(err) return res.status(403).json({message:"Unverified Refresh Token"});
        Session.findAll({ where: { ownerId: userData.userId } })
        .then(data => {
            let allSessions = data.map(item => decrypt(item.dataValues.refreshToken));
            if(!allSessions.includes(refreshToken)) return res.status(403).json({message:"Invalid Refresh Token"});
            const accessToken = createAccessToken(userData);
            return res.status(200).json({ accessToken });
        })
        .catch(err => {
            console.log("Unexpected Error on Loading Session");
        })
    });
})


module.exports = router;