const { DataTypes } = require("sequelize");
const db = require("../database/database");

const User = db.define("user", {

  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },

});

module.exports = User;
