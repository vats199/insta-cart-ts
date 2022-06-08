import express, { Express } from "express";

import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import path from "path";

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
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('views', path.join(__dirname, 'views'));

import * as authRoutes from "./routes/authRoutes";
import * as userRoutes from "./routes/userRoutes";
import * as shopRoutes from "./routes/shopRoutes";

app.use('/auth', authRoutes.default);
app.use('/user', userRoutes.default);
app.use('/', shopRoutes.default);

import User from "./models/userModel";
import Token from "./models/tokenModel";
import Address from "./models/addressModel";
import Store from "./models/storeModel";
import Category from "./models/categoryModel";
import item from "./models/itemModel";
import order from "./models/orderModel";
import orderItem from "./models/orderItemModel";
import card from "./models/cardModel";
import payment from "./models/paymentModel";

import { sequelize } from "./util/database";

Token.belongsTo(User, {constraints: true, onDelete: 'CASCADE', foreignKey: 'userId'})
Address.belongsTo(User, {constraints: true, onDelete: 'CASCADE', foreignKey: 'userId'})
User.hasMany(Address, {constraints: true, onDelete: 'CASCADE', foreignKey: 'userId'})
Category.belongsTo(Store, {constraints: true, onDelete: 'CASCADE', foreignKey: 'storeId'})
Store.hasMany(Category, {constraints: true, onDelete: 'CASCADE', foreignKey: 'storeId'})
item.belongsTo(Category, {constraints: true, onDelete: 'CASCADE', foreignKey: 'categoryId'})
Category.hasMany(item, {constraints: true, onDelete: 'CASCADE', foreignKey: 'categoryId'})
order.belongsTo(User, {foreignKey: 'userId'});
User.hasMany(order, {foreignKey: 'userId'});
orderItem.belongsTo(order, {foreignKey: 'orderId', targetKey: 'id'});
order.hasMany(orderItem, {foreignKey: 'orderId'});
orderItem.belongsTo(item, {foreignKey: 'itemId', targetKey: 'id'});
order.belongsToMany(item, { through: orderItem, foreignKey: 'orderId' });
order.belongsTo(Address, {foreignKey: 'addressId'});
Address.hasMany(order, {foreignKey: 'addressId'});
card.belongsTo(User, {constraints: true, onDelete: 'CASCADE', foreignKey: 'userId'})
User.hasMany(card, {constraints: true, onDelete: 'CASCADE', foreignKey: 'userId'})
payment.belongsTo(User, {constraints: true, onDelete: 'CASCADE', foreignKey: 'userId'})
User.hasMany(payment, {constraints: true, onDelete: 'CASCADE', foreignKey: 'userId'})

sequelize
        //  .sync({force:true})
         .sync()
         .then(__database => {
          console.log('Database Connected Successfully.')
        })
         .then((_result)=>{
           app.listen(PORT, (_port: void) => {
             console.log('Server is running on port : ' + PORT);
             
           })
         }).catch(err => {
          console.log(err);
        });