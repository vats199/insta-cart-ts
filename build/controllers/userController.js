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
exports.getInvoice = exports.getOrders = exports.postOrder = exports.activateAddress = exports.deleteAddress = exports.editAddress = exports.getAddresses = exports.postAddress = exports.editEmail = exports.editName = exports.getProfile = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const addressModel_1 = __importDefault(require("../models/addressModel"));
const itemModel_1 = __importDefault(require("../models/itemModel"));
const orderModel_1 = __importDefault(require("../models/orderModel"));
const orderItemModel_1 = __importDefault(require("../models/orderItemModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const path = __importStar(require("path"));
const const_1 = require("../util/const");
const response_1 = require("../util/response");
const pdfkit_1 = __importDefault(require("pdfkit"));
const check_1 = require("express-validator/check");
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            return (0, response_1.errorResponse)(res, const_1.globals.StatusNotFound, const_1.globalResponse.UserNotFound, null);
        }
        const data = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.country_code + user.phone_number
        };
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.UserFound, data);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.getProfile = getProfile;
const editName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    try {
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            return (0, response_1.errorResponse)(res, const_1.globals.StatusNotFound, const_1.globalResponse.UserNotFound, null);
        }
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        yield user.save();
        const result = yield userModel_1.default.findByPk(userId, { attributes: { exclude: ['password'] } });
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.UserUpdated, result);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.editName = editName;
const editEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, response_1.errorResponse)(res, const_1.globals.StatusBadRequest, errors.array()[0].msg, null);
    }
    const userId = req.user.id;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const test = yield userModel_1.default.findByPk(userId);
        const test1 = yield userModel_1.default.findOne({ where: { email: email } });
        if (test1) {
            return (0, response_1.errorResponse)(res, const_1.globals.StatusBadRequest, const_1.globalResponse.EmailCheck, null);
        }
        const passCheck = yield bcryptjs_1.default.compare(password, test.password);
        if (!passCheck) {
            return (0, response_1.errorResponse)(res, const_1.globals.StatusBadRequest, const_1.globalResponse.InvalidCredentials, null);
        }
        test.email = email;
        yield test.save();
        const resp = yield userModel_1.default.findByPk(userId, { attributes: { exclude: ['password'] } });
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.UserUpdated, resp);
    }
    catch (error) {
        console.log(error);
    }
});
exports.editEmail = editEmail;
const postAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        addressInfo: req.body.address,
        address_type: req.body.address_type || 0,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        userId: req.user.id,
        is_active: 1
    };
    try {
        const address = yield addressModel_1.default.create(payload);
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.AddressAdded, address);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.postAddress = postAddress;
const getAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const addresses = yield addressModel_1.default.findAll({ where: { userId: userId } });
        const data = {};
        data.totalAddresses = addresses.length;
        data.addresses = addresses;
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.AddressesFetched, data);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.getAddresses = getAddresses;
const editAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const addressId = req.params.addressId;
    try {
        const address = yield addressModel_1.default.findOne({ where: { userId: userId, id: addressId } });
        if (address) {
            address.addressInfo = req.body.address || address.addressInfo;
            address.icon = req.body.icon || address.icon;
            address.address_type = req.body.address_type || address.address_type;
            address.latitude = req.body.latitude || address.latitude;
            address.longitude = req.body.longitude || address.longitude;
            try {
                const result = yield address.save();
                return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.AddressUpdated, result);
            }
            catch (err) {
                console.log(err);
                return (0, response_1.errorResponse)(res, const_1.globals.StatusNotFound, const_1.globalResponse.Error, null);
            }
        }
        else {
            return (0, response_1.errorResponse)(res, const_1.globals.StatusBadRequest, const_1.globalResponse.NoAddress, null);
        }
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.editAddress = editAddress;
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const addressId = req.body.addressId;
    const userId = req.user.id;
    try {
        yield addressModel_1.default.destroy({ where: { id: addressId, userId: userId } });
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.AddressUpdated, null);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.deleteAddress = deleteAddress;
const activateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const addressId = req.body.addressId;
    try {
        const address = yield addressModel_1.default.findOne({ where: { id: addressId, userId: userId } });
        if (address.is_active == true) {
            return (0, response_1.errorResponse)(res, const_1.globals.StatusBadRequest, const_1.globalResponse.AddressAlreadyActive, null);
        }
        else {
            address.is_active = 1;
            const otherAddresses = yield addressModel_1.default.findAll({ where: { is_active: 1, userId } });
            if (otherAddresses.length !== 0) {
                for (let i = 0; i < otherAddresses.length; i++) {
                    otherAddresses[i].is_active = false;
                    yield otherAddresses[i].save();
                }
            }
            const result = yield address.save();
            return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.AddressActivated, result);
        }
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.activateAddress = activateAddress;
const postOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id, items = req.body.items, order_type = req.body.order_type, delivery_time = req.body.delivery_time, amount = req.body.amount, discount_amount = req.body.discount_amount, addressId = req.body.addressId, country_code = req.body.country_code, phone_number = req.body.phone_number, instructions = req.body.instructions, is_gift = req.body.is_gift;
    const net_amount = amount - discount_amount;
    try {
        const ord = yield orderModel_1.default.create({
            userId: userId,
            order_type: order_type,
            delivery_time: delivery_time,
            country_code: country_code,
            phone_number: country_code + phone_number,
            instructions: instructions,
            is_gift: is_gift,
            addressId: addressId,
            amount: amount,
            discount_amount: discount_amount,
            net_amount: net_amount
        });
        for (let j = 0; j < items.length; j++) {
            if (items[j]) {
                yield orderItemModel_1.default.create({
                    itemId: items[j].id,
                    orderId: ord.id,
                    quantity: items[j].qty,
                    itemTotal: (items[j].qty) * (items[j].price)
                });
            }
        }
        const resp = yield orderModel_1.default.findByPk(ord.id, { include: { model: orderItemModel_1.default, include: [itemModel_1.default] } });
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.OrderPlaced, resp);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.postOrder = postOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const orders = yield orderModel_1.default.findAll({ where: { userId: userId }, include: { model: orderItemModel_1.default, include: [itemModel_1.default] } });
        // const orders = await order.findAll({where: {userId: userId}, include: item})
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.OrdersFetched, orders);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.getOrders = getOrders;
const getInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    const invoiceName = 'Order #' + orderId + ' Invoice' + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);
    try {
        const ord = yield orderModel_1.default.findOne({ where: { userId: userId, id: orderId }, include: itemModel_1.default });
        const pdfDoc = new pdfkit_1.default();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoicePath + '"');
        // pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(30).text('Insta-Cart', {
            align: 'center'
        });
        pdfDoc.fontSize(22).text('Invoice', {
            underline: true
        });
        pdfDoc.text('  ');
        let total = 0;
        ord.items.forEach((item) => {
            total += item.price * item.orderItem.quantity;
        });
        total -= ord.discount_amount;
        let i;
        let invoiceTableTop = 160;
        pdfDoc.font("Helvetica-Bold");
        generateTableRowHeader(pdfDoc, 160, 'Name', "Unit Price", 'Quantity', 'Item Total');
        generateHr(pdfDoc, invoiceTableTop + 20);
        pdfDoc.font("Helvetica");
        for (i = 0; i < ord.items.length; i++) {
            const item = ord.items[i];
            const position = invoiceTableTop + (i + 1) * 30;
            generateTableRow(pdfDoc, position, item.title, item.price, item.orderItem.quantity, item.price * item.orderItem.quantity);
        }
        pdfDoc.text(' ');
        pdfDoc.text(' ');
        pdfDoc.text(' ');
        pdfDoc.text('-' + ord.discount_amount, { align: 'right' });
        pdfDoc.text('_____________________________', { align: 'right' });
        pdfDoc.text('  ');
        pdfDoc.fontSize(16).text('Total Price: $' + total, { align: 'right' });
        pdfDoc.text('  ');
        pdfDoc.fontSize(10).text('--------Thanks for shopping at InstaCart--------', {
            align: 'center'
        });
        pdfDoc.end();
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.getInvoice = getInvoice;
function generateTableRow(doc, y, c2, c3, c4, c5) {
    doc.fontSize(10)
        .text(c2, 150, y)
        .text(c3, 280, y, { width: 90, align: 'right' })
        .text(c4, 370, y, { width: 90, align: 'right' })
        .text(c5, 0, y, { align: 'right' });
}
function generateTableRowHeader(doc, y, c2, c3, c4, c5) {
    doc.fontSize(10)
        .text(c2, 150, y)
        .text(c3, 280, y, { width: 90, align: 'right' })
        .text(c4, 370, y, { width: 90, align: 'right' })
        .text(c5, 0, y, { align: 'right' });
}
function generateHr(doc, y) {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}
