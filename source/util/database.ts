import { Sequelize } from "sequelize/types";
require("dotenv").config();

// const db: sequelize = {}

export const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    dialect: 'mysql',
    host: 'remotemysql.com',
    port: 3306,

    pool: {
        max: 5, 
        min: 0, 
        acquire: 30000,
        idle: 10000
    }
})
// export const Sequelize = Sequelize;
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// export db;