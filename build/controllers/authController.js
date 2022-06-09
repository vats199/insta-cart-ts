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
exports.postNewPassword = exports.getNewPassword = exports.resetPasswordLink = exports.refreshToken = exports.verifyOTP = exports.generateOTP = exports.otpLogin = exports.Logout = exports.Login = exports.Signup = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const tokenModel_1 = __importDefault(require("../models/tokenModel"));
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const check_1 = require("express-validator/check");
const jwt = __importStar(require("jsonwebtoken"));
const twilio_1 = require("twilio");
const mail = __importStar(require("node-mailjet"));
const sequelize_1 = require("sequelize");
const stripe_1 = __importDefault(require("stripe"));
const const_1 = require("../util/const");
const response_1 = require("../util/response");
const stripe = new stripe_1.default(process.env.STRIPE_SK, { apiVersion: '2020-08-27' });
const mailjet = mail.connect(process.env.mjapi, process.env.mjsecret);
const client = new twilio_1.Twilio(process.env.accountSID, process.env.authToken);
let refreshTokens = {};
const Signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(const_1.globals.StatusBadRequest).json({ message: errors.array()[0].msg, status: const_1.globals.Failed });
    }
    try {
        const userData = {
            email: req.body.email,
            password: req.body.password
        };
        const test = yield userModel_1.default.findOne({ where: { email: req.body.email } });
        if (!test) {
            bcryptjs_1.default.hash(req.body.password, 10, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    console.log(err);
                    return res.status(const_1.globals.StatusBadRequest).json({ message: "Error occured in incrypting password", status: const_1.globals.Failed });
                }
                userData.password = hash;
                const customer = yield stripe.customers.create({
                    email: req.body.email,
                    description: 'Insta-Cart Customer!'
                });
                userData.stripe_id = customer.id;
                const user = yield userModel_1.default.create(userData);
                const resp = yield userModel_1.default.findByPk(user.id, { attributes: { exclude: ['password'] } });
                return (0, response_1.successResponse)(res, const_1.globals.StatusCreated, const_1.globalResponse.RegistrationSuccess, resp);
            }));
        }
        else {
            return res.json({ error: "USER ALREADY EXISTS", status: const_1.globals.Failed });
        }
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.Signup = Signup;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(const_1.globals.StatusBadRequest).json({ message: errors.array()[0].msg, status: const_1.globals.Failed });
    }
    try {
        const test = yield userModel_1.default.findOne({ where: { email: req.body.email } });
        if (!test || test == null || test == undefined) {
            return res.status(const_1.globals.StatusOK).json({ message: "User does not exist!", status: const_1.globals.Failed });
        }
        const passCheck = yield bcryptjs_1.default.compare(req.body.password, test.password);
        if (!passCheck) {
            return res.status(const_1.globals.StatusBadRequest).json({ error: 'Invalid Email or Password!', status: const_1.globals.Failed });
        }
        test.is_active = true;
        yield test.save();
        const loadedUser = yield userModel_1.default.findByPk(test.id, { attributes: { exclude: ['password'] } });
        const accessToken = jwt.sign({ loadedUser }, process.env.secret, { expiresIn: process.env.jwtExpiration });
        const refreshToken = jwt.sign({ loadedUser }, process.env.refSecret, { expiresIn: process.env.jwtRefExpiration });
        refreshTokens[refreshToken] = { accessToken: accessToken, refreshToken: refreshToken };
        const getToken = yield tokenModel_1.default.findOne({ where: { userId: test.id } });
        if (getToken) {
            getToken.login_count += 1;
            getToken.accessToken = accessToken;
            getToken.refreshToken = refreshToken;
            yield getToken.save();
            const data = {};
            data.accessToken = accessToken;
            data.refreshToken = refreshToken;
            data.user = loadedUser;
            return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.LoginSuccess, data);
        }
        else {
            const payload = {
                userId: test.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
                login_count: 1
            };
            yield tokenModel_1.default.create(payload);
            const data = {};
            data.accessToken = accessToken;
            data.refreshToken = refreshToken;
            data.user = loadedUser;
            return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.LoginSuccess, data);
        }
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.Login = Login;
const Logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const getToken = yield tokenModel_1.default.findOne({ where: { userId: userId } });
        const user = yield userModel_1.default.findByPk(userId);
        if (getToken) {
            if (getToken.accessToken == null) {
                return res.json({ error: "User already Logged-out!", status: const_1.globals.Failed });
            }
            else {
                getToken.accessToken = null;
                user.is_active = false;
                yield user.save();
                yield getToken.save();
                return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.LogoutSuccess, null);
            }
        }
        else {
            return res.json({ error: "Log-out Failed!", status: const_1.globals.Failed });
        }
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.Logout = Logout;
const otpLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(const_1.globals.StatusBadRequest).json({ message: errors.array()[0].msg, status: const_1.globals.Failed });
    }
    const country_code = req.body.country_code;
    const number = req.body.phone_number;
    try {
        const user = yield userModel_1.default.findOne({ where: { country_code: country_code, phone_number: number } });
        if (!user) {
            return res.status(const_1.globals.StatusBadRequest).json({ message: "User does not exist!", status: 0 });
        }
        user.is_active = true;
        yield user.save();
        const loadedUser = yield userModel_1.default.findByPk(user.id, { attributes: { exclude: ['password'] } });
        const otp = yield client.verify
            .services(process.env.serviceID)
            .verificationChecks
            .create({
            to: `${country_code}${number}`,
            code: req.body.otpValue
        });
        if (otp.valid == true) {
            const accessToken = jwt.sign({ loadedUser }, process.env.secret, { expiresIn: process.env.jwtExpiration });
            const refreshToken = jwt.sign({ loadedUser }, process.env.refSecret, { expiresIn: process.env.jwtRefExpiration });
            refreshTokens[refreshToken] = { accessToken: accessToken, refreshToken: refreshToken };
            const getToken = yield tokenModel_1.default.findOne({ where: { userId: user.id } });
            if (getToken) {
                getToken.login_count += 1;
                getToken.accessToken = accessToken;
                getToken.refreshToken = refreshToken;
                yield getToken.save();
                const data = {};
                data.accessToken = accessToken;
                data.refreshToken = refreshToken;
                data.user = loadedUser;
                return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.LoginSuccess, data);
            }
            else {
                const payload = {
                    userId: user.id,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    login_count: 1
                };
                yield tokenModel_1.default.create(payload);
                const data = {};
                data.accessToken = accessToken;
                data.refreshToken = refreshToken;
                data.user = loadedUser;
                return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.LoginSuccess, data);
            }
        }
        else {
            return res.status(const_1.globals.StatusBadRequest).json({ error: "Invalid OTP entered!", status: const_1.globals.Failed });
        }
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.otpLogin = otpLogin;
const generateOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(const_1.globals.StatusBadRequest).json({ message: errors.array()[0].msg, status: const_1.globals.Failed });
    }
    const country_code = req.body.country_code;
    const number = req.body.phone_number;
    try {
        const otp = yield client.verify
            .services(process.env.serviceID)
            .verifications
            .create({
            to: `${country_code}${number}`,
            channel: req.body.channel
        });
        if (otp.status == 'pending') {
            return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.OtpSent, null);
        }
        else {
            return res.status(const_1.globals.StatusBadRequest).json({ message: "Some error occured", status: const_1.globals.Failed });
        }
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.generateOTP = generateOTP;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(const_1.globals.StatusBadRequest).json({ message: errors.array()[0].msg, status: const_1.globals.Failed });
    }
    const country_code = req.body.country_code;
    const number = req.body.phone_number;
    const userId = req.user.id;
    try {
        const otp = yield client.verify
            .services(process.env.serviceID)
            .verificationChecks
            .create({
            to: `${country_code}${number}`,
            code: req.body.otpValue
        });
        if (otp.valid == true) {
            const user = yield userModel_1.default.findByPk(userId);
            if (user) {
                user.country_code = country_code || user.country_code;
                user.phone_number = number || user.phone_number;
                user.is_verify = true;
                yield user.save();
            }
            return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.OtpVerified, null);
        }
        else {
            return res.status(const_1.globals.StatusBadRequest).json({ message: "Invalid OTP entered!", status: const_1.globals.Failed });
        }
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.verifyOTP = verifyOTP;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken || !(refreshToken in refreshTokens)) {
        return res.status(const_1.globals.StatusNotAcceptable).json({ error: "Invalid RefreshToken!", status: const_1.globals.Failed });
    }
    jwt.verify(refreshToken, "somesupersuperrefreshsecret", (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        if (!err) {
            const accessToken = jwt.sign({ user: user.loadedUser }, process.env.secret, { expiresIn: process.env.jwtExpiration });
            yield tokenModel_1.default.update({ accessToken: accessToken }, { where: { refreshToken: refreshToken } }).then(res => console.log(res)).catch(err => console.log(err));
            return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.RenewAccessToken, accessToken);
        }
        else {
            return res.status(const_1.globals.StatusUnauthorized).json({ error: "User not Authenticated!", status: const_1.globals.Failed });
        }
    }));
});
exports.refreshToken = refreshToken;
const resetPasswordLink = (req, res) => {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(const_1.globals.StatusBadRequest).json({ message: errors.array()[0].msg, status: const_1.globals.Failed });
    }
    try {
        crypto_1.default.randomBytes(32, (err, buffer) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(const_1.globals.StatusBadRequest).json({ message: "Some error occurred!", status: const_1.globals.Failed });
            }
            const token = buffer.toString('hex');
            const user = yield userModel_1.default.findOne({ where: { email: req.body.email } });
            if (!user) {
                return res.status(const_1.globals.StatusBadRequest).json({ message: "No account found for this email!", status: const_1.globals.Failed });
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            yield user.save();
            const link = yield mailjet.post("send", { 'version': 'v3.1' })
                .request({
                "Messages": [
                    {
                        "From": {
                            "Email": "vatsalp.tcs@gmail.com",
                            "Name": "Vatsal"
                        },
                        "To": [
                            {
                                "Email": req.body.email
                            }
                        ],
                        "Subject": "Greetings from Insta-Cart.",
                        "HTMLPart": `
                                                                        <p>You requested to reset your password for our website</p>
                                                                        <p>Click on this <a href="http://localhost:3000/auth/resetPassword/${token}">link</a> to reset a new password
                                                                        `,
                        "CustomID": "AppGettingStartedTest"
                    }
                ]
            });
            if (link) {
                return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.ResetPasswordLinkSent, null);
            }
            else {
                return res.status(const_1.globals.StatusBadRequest).json({ message: "Link generation failed!", status: const_1.globals.Failed });
            }
        }));
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
};
exports.resetPasswordLink = resetPasswordLink;
const getNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    try {
        const user = yield userModel_1.default.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [sequelize_1.Op.gt]: Date.now() }
            }
        });
        if (!user) {
            return res.status(const_1.globals.StatusBadRequest).json({ message: "Link is invalid", status: const_1.globals.Failed });
        }
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            userId: user.id,
            passwordToken: token
        });
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.getNewPassword = getNewPassword;
const postNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(const_1.globals.StatusBadRequest).json({ message: errors.array()[0].msg, status: const_1.globals.Failed });
    }
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let resetUser;
    try {
        if (newPassword !== confirmPassword) {
            return res.status(const_1.globals.StatusBadRequest).json({ message: 'Passwords does not match!', status: const_1.globals.Failed });
        }
        const user = yield userModel_1.default.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [sequelize_1.Op.gt]: Date.now() },
                id: userId
            }
        });
        if (!user) {
            return res.status(const_1.globals.StatusBadRequest).json({ message: 'Invalid Link!', status: const_1.globals.Failed });
        }
        resetUser = user;
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        resetUser.password = hashedPassword;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = null;
        yield resetUser.save();
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.PasswordChanged, null);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.postNewPassword = postNewPassword;
