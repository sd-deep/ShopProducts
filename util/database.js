const Sequelize = require('sequelize')

const sequelize = new Sequelize('node-complete','root','mydbpass',{
    dialect:'mysql',
    host:'localhost'
});

module.exports = sequelize;