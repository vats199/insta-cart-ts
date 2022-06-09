"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
const PORT = process.env.PORT || 3000;
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    next();
});
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('views', path_1.default.join(__dirname, 'views'));
const authRoutes = __importStar(require("./routes/authRoutes"));
const userRoutes = __importStar(require("./routes/userRoutes"));
const shopRoutes = __importStar(require("./routes/shopRoutes"));
app.use('/auth', authRoutes.default);
app.use('/user', userRoutes.default);
app.use('/', shopRoutes.default);
const userModel_1 = __importDefault(require("./models/userModel"));
const tokenModel_1 = __importDefault(require("./models/tokenModel"));
const addressModel_1 = __importDefault(require("./models/addressModel"));
const storeModel_1 = __importDefault(require("./models/storeModel"));
const categoryModel_1 = __importDefault(require("./models/categoryModel"));
const itemModel_1 = __importDefault(require("./models/itemModel"));
const orderModel_1 = __importDefault(require("./models/orderModel"));
const orderItemModel_1 = __importDefault(require("./models/orderItemModel"));
const cardModel_1 = __importDefault(require("./models/cardModel"));
const paymentModel_1 = __importDefault(require("./models/paymentModel"));
const database_1 = require("./util/database");
tokenModel_1.default.belongsTo(userModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'userId' });
addressModel_1.default.belongsTo(userModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'userId' });
userModel_1.default.hasMany(addressModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'userId' });
categoryModel_1.default.belongsTo(storeModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'storeId' });
storeModel_1.default.hasMany(categoryModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'storeId' });
itemModel_1.default.belongsTo(categoryModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'categoryId' });
categoryModel_1.default.hasMany(itemModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'categoryId' });
orderModel_1.default.belongsTo(userModel_1.default, { foreignKey: 'userId' });
userModel_1.default.hasMany(orderModel_1.default, { foreignKey: 'userId' });
orderItemModel_1.default.belongsTo(orderModel_1.default, { foreignKey: 'orderId', targetKey: 'id' });
orderModel_1.default.hasMany(orderItemModel_1.default, { foreignKey: 'orderId' });
orderItemModel_1.default.belongsTo(itemModel_1.default, { foreignKey: 'itemId', targetKey: 'id' });
orderModel_1.default.belongsToMany(itemModel_1.default, { through: orderItemModel_1.default, foreignKey: 'orderId' });
orderModel_1.default.belongsTo(addressModel_1.default, { foreignKey: 'addressId' });
addressModel_1.default.hasMany(orderModel_1.default, { foreignKey: 'addressId' });
cardModel_1.default.belongsTo(userModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'userId' });
userModel_1.default.hasMany(cardModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'userId' });
paymentModel_1.default.belongsTo(userModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'userId' });
userModel_1.default.hasMany(paymentModel_1.default, { constraints: true, onDelete: 'CASCADE', foreignKey: 'userId' });
database_1.sequelize
    //  .sync({force:true})
    .sync()
    .then(__database => {
    console.log('Database Connected Successfully.');
})
    .then((_result) => {
    app.listen(PORT, (_port) => {
        console.log('Server is running on port : ' + PORT);
    });
}).catch(err => {
    console.log(err);
});
