require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Sequelize } = require("sequelize");

/**
 * Database
 */
const db = require("../database/database.js");

db.sync({ force: true })
  .then((result) => {
    console.log("Tables Created!");
  })
  .catch((error) => {
    console.log("Error: ", error);
  });

/**
 * Utilities
 */
function createAccessToken(user) {
  return jwt.sign(parseUser(user), process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
}

function parseUser(user) {
  return { userId: user.userId };
}

function deSensitize(user) {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
  };
}

function completeUser(user, context) {
  if (context == "login") {
    if (
      user.hasOwnProperty("email") &&
      user.hasOwnProperty("password") &&
      user.email !== "" &&
      user.password !== ""
    ) {
      return true;
    }
  } else if (context == "signup") {
    if (
      user.hasOwnProperty("email") &&
      user.hasOwnProperty("name") &&
      user.hasOwnProperty("password") &&
      user.email !== "" &&
      user.name !== "" &&
      user.password !== ""
    ) {
      return true;
    }
  }

  return false;
}

function populateUser(user) {
  let populated = {
    userId: crypto.randomBytes(16).toString("hex"),
    name: user.name,
    email: user.email,
    password: user.password,
    emailVerified: false,
  };
  return populated;
}

/**
 * Authentication Routes
 */
router.get("/", (req, res) => {
  return res.status(200).json({ message: "Authentication Route" });
});

router.post("/signup", (req, res) => {
  const { user } = req.body;
  if (!user || !completeUser(user, "signup"))
    return res.status(404).json({ message: "User Information Not Provided" });

  User.count({ where: Sequelize.or({ email: user.email }) })
    .then((count) => {
      if (count != 0)
        return res.status(409).json({ message: "User Already Exists" });

      bcrypt
        .hash(user.password, 8)
        .then(function (hash) {
          user.password = hash;
          let fullUser = populateUser(user);
          User.create(fullUser)
            .then((data) => {
              let userData = data.dataValues;
              let accessToken = createAccessToken(userData);
              let deSensitized = deSensitize(userData);
              return res.status(200).json({ ...deSensitized, accessToken });
            })
            .catch((err) => {
              return res
                .status(500)
                .json({ message: "Unexpected Error on User Creation" });
            });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ message: "Unexpected Error on Encryption" });
        });
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: "Unexpected Error on Reading from Database" });
    });
});

router.post("/login", (req, res) => {
  const { user } = req.body;
  if (!user || !completeUser(user, "login"))
    return res.status(404).json({ message: "User Information Not Provided" });

  User.findOne({ where: { email: user.email } })
    .then((data) => {
      if (data === null)
        return res.status(404).json({ message: "User Do Not Exists" });
      let userData = data.dataValues;
      bcrypt
        .compare(user.password, userData.password)
        .then(function (isMatch) {
          if (!isMatch)
            return res.status(403).json({ message: "Password Not Verified" });
          let accessToken = createAccessToken(userData);
          let deSensitized = deSensitize(userData);
          return res.status(200).json({ ...deSensitized, accessToken });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ message: "Unexpected Error on Decryption" });
        });
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: "Unexpected Error on Reading from Database" });
    });
});

module.exports = router;
