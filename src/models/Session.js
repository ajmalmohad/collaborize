const { DataTypes } = require("sequelize");
const db = require("../database/database");

const Session = db.define("session", {

  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }

});

module.exports = Session;
