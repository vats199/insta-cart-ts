import express, { Express } from "express";

import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use((req, res, next)=> {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    next();
})

import User from "./models/userModel";
import Token from "./models/tokenModel";

import { sequelize } from "./util/database";

Token.belongsTo(User, {constraints: true, onDelete: 'CASCADE'})

sequelize.sync()
         .then(_database => {
          console.log('Database Connected Successfully.')
        })
         .then((_result)=>{
           app.listen(PORT, (_port: void) => {
             console.log('Server is running on port : ' + PORT);
             
           })
         }).catch(err => {
          console.log(err);
        });