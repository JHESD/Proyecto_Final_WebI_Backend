const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.POSTGRESQL_DATABASE || 'db_web_end',
    process.env.POSTGRESQL_USER || 'postgres',
    process.env.POSTGRESQL_PASSWORD || '1234',
    {
        host: process.env.POSTGRESQL_HOST || 'localhost',
        dialect: 'postgres',
        port: process.env.POSTGRESQL_PORT || 5432
    }
);

module.exports = sequelize ;