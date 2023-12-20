const { Sequelize } = require('sequelize');

const configDB = {
    "sqlite": { dialect: 'sqlite', storage: './database/user.db' },
    "postgres": 'postgres://user:pass@example.com:5432/dbname',
};

const db = new Sequelize(configDB["sqlite"]);
db.authenticate()
    .then(() => console.log('DB Connected🚀'))
    .catch(err => console.log('Error: ', err));

module.exports = db;