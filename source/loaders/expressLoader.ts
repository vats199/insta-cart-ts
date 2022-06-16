import express from "express";

import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import * as dotenv from "dotenv";
import * as authRoutes from "../routes/authRoutes";
import * as userRoutes from "../routes/userRoutes";
import * as shopRoutes from "../routes/shopRoutes";


export default async ({app}:{app: express.Application}) => {
    dotenv.config();
    app.use(cors());
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    
    
    app.use((req, res, next)=> {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, PATCH, DELETE"
            );
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
            next();
        })
        app.set('view engine', 'ejs');
        app.set('views', 'views');
        app.set('views', path.join(__dirname, 'views'));
        
        app.use('/auth', authRoutes.default);
        app.use('/user', userRoutes.default);
        app.use('/', shopRoutes.default);

    return app;
}