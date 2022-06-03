import { Sequelize } from "sequelize-typescript";
require("dotenv").config();

const db: any = process.env.MYSQL_DATABASE
const user: any = process.env.MYSQL_USER
const pass:any = process.env.MYSQL_PASSWORD
// const db: sequelize = {}

export const sequelize = new Sequelize(db, user, pass, {
    dialect: 'mysql',
    host: 'remotemysql.com',
    models: ['/Volumes/DATA/Projects/insta-cart-ts/source/models'],

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