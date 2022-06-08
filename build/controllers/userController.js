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
exports.deleteAddress = exports.editAddress = exports.getAddresses = exports.postAddress = exports.getProfile = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const addressModel_1 = __importDefault(require("../models/addressModel"));
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const user = yield userModel_1.default.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found!", status: 0 });
        }
        const data = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.country_code + user.phone_number
        };
        return res.status(200).json({ message: "User Found!", status: 1 });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.getProfile = getProfile;
const postAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        addressInfo: req.body.address,
        icon: req.body.icon,
        address_type: req.body.address_type || 0,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        userId: req.user.id
    };
    try {
        const address = yield addressModel_1.default.create(payload);
        return res.status(200).json({ message: 'Address added!', data: address, status: 1 });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.postAddress = postAddress;
const getAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const addresses = yield addressModel_1.default.findAll({ where: { userId: userId } });
        return res.status(200).json({ message: "Addresses fetched!", totalAddresses: addresses.length, data: addresses, status: 1 });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
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
                return res.status(200).json({ message: "Address Updated!", data: result, status: 1 });
            }
            catch (err) {
                console.log(err);
                return res.status(404).json({ error: "Address Not Updated!", status: 0 });
            }
        }
        else {
            return res.status(400).json({ message: "No address found for given id!", status: 0 });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.editAddress = editAddress;
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const addressId = req.body.addressId;
    const userId = req.user.id;
    try {
        yield addressModel_1.default.destroy({ where: { id: addressId, userId: userId } });
        return res.status(200).json({ message: "Address Deleted!", status: 0 });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.deleteAddress = deleteAddress;
