"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
require("dotenv").config();
const db = process.env.MYSQL_DATABASE;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PASSWORD;
// const db: sequelize = {}
exports.sequelize = new sequelize_typescript_1.Sequelize(db, user, pass, {
    dialect: "mysql",
    host: "remotemysql.com",
    models: ["/Volumes/DATA/Projects/insta-cart-ts/source/models"],
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
// export const Sequelize = Sequelize;
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;
// export db;
