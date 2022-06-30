import User from "../models/userModel";
import Token from "../models/tokenModel";
import Address from "../models/addressModel";
import Store from "../models/storeModel";
import Category from "../models/categoryModel";
import item from "../models/itemModel";
import order from "../models/orderModel";
import orderItem from "../models/orderItemModel";
import card from "../models/cardModel";
import payment from "../models/paymentModel";
import * as dotenv from "dotenv";

import { sequelize } from "../util/database";

Token.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "userId",
});
Address.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "userId",
});
User.hasMany(Address, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "userId",
});
Category.belongsTo(Store, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "storeId",
});
Store.hasMany(Category, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "storeId",
});
item.belongsTo(Category, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "categoryId",
});
Category.hasMany(item, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "categoryId",
});
order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(order, { foreignKey: "userId" });
orderItem.belongsTo(order, { foreignKey: "orderId", targetKey: "id" });
order.hasMany(orderItem, { foreignKey: "orderId" });
orderItem.belongsTo(item, { foreignKey: "itemId", targetKey: "id" });
order.belongsToMany(item, { through: orderItem, foreignKey: "orderId" });
order.belongsTo(Address, { foreignKey: "addressId" });
Address.hasMany(order, { foreignKey: "addressId" });
card.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "userId",
});
User.hasMany(card, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "userId",
});
payment.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "userId",
});
User.hasMany(payment, {
  constraints: true,
  onDelete: "CASCADE",
  foreignKey: "userId",
});

export default async (): Promise<any> => {
  dotenv.config();
  const connection = await sequelize
    //  .sync({force:true})
    .sync();
  return connection;
};
