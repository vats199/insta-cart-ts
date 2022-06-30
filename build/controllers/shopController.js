"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.getItem = exports.getSingleStore = exports.getStores = void 0;
const itemModel_1 = __importDefault(require("../models/itemModel"));
const storeModel_1 = __importDefault(require("../models/storeModel"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const const_1 = require("../util/const");
const response_1 = require("../util/response");
const sequelize_1 = require("sequelize");
const getStores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stores = yield storeModel_1.default.findAll({ include: categoryModel_1.default });
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.StoresFetched, stores);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.getStores = getStores;
const getSingleStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const storeId = req.params.storeId;
    try {
        const categories = yield categoryModel_1.default.findAll({ include: itemModel_1.default });
        const store = yield storeModel_1.default.findByPk(storeId);
        const data = {};
        data.store = store;
        data.categories = categories;
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.SingleStoreFetched, data);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.getSingleStore = getSingleStore;
const getItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemId = req.params.itemId;
    try {
        const data = yield itemModel_1.default.findOne({ where: { id: itemId } });
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.ItemsFetched, data);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.getItem = getItem;
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const term = req.query.term;
    const storeId = req.query.storeId;
    try {
        if (storeId) {
            const categories = yield categoryModel_1.default.findAll({
                include: itemModel_1.default,
                where: { title: { [sequelize_1.Op.like]: "%" + term + "%" }, storeId: storeId },
            });
            const data = {};
            data.totalResult = categories.length;
            data.categories = categories;
            return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.SearchResponse, data);
        }
        else {
            const categories = yield categoryModel_1.default.findAll({
                include: [storeModel_1.default, itemModel_1.default],
                where: { title: { [sequelize_1.Op.like]: "%" + term + "%" } },
            });
            const items = yield itemModel_1.default.findAll({
                include: categoryModel_1.default,
                where: { title: { [sequelize_1.Op.like]: "%" + term + "%" } },
            });
            const stores = yield storeModel_1.default.findAll({
                include: categoryModel_1.default,
                where: { name: { [sequelize_1.Op.like]: "%" + term + "%" } },
            });
            const data = {};
            data.totalResults = categories.length + items.length + stores.length;
            data.categories = categories;
            data.stores = stores;
            data.items = items;
            return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.SearchResponse, data);
        }
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.search = search;
