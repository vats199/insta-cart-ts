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
const mailjet = mail.connect(process.env.mjapi, process.env.mjsecret);
const client = new twilio_1.Twilio(process.env.accountSID, process.env.authToken);
let refreshTokens = {};
const Signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, status: 0 });
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
                    return res.status(400).json({ message: "Error occured in incrypting password", status: 0 });
                }
                userData.password = hash;
                const user = yield userModel_1.default.create(userData);
                const resp = yield userModel_1.default.findByPk(user.id, { attributes: { exclude: ['password'] } });
                return res.status(200).json({ message: "Registration successful", userData: resp, status: 1 });
            }));
        }
        else {
            return res.json({ error: "USER ALREADY EXISTS", status: 0 });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.Signup = Signup;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, status: 0 });
    }
    try {
        const test = yield userModel_1.default.findOne({ where: { email: req.body.email } });
        if (!test || test == null || test == undefined) {
            return res.status(200).json({ message: "User does not exist!", status: 0 });
        }
        const passCheck = yield bcryptjs_1.default.compare(req.body.password, test.password);
        if (!passCheck) {
            return res.status(400).json({ error: 'Invalid Email or Password!', status: 0 });
        }
        test.is_active = 1;
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
            return res.status(200).json({
                message: 'Logged-in Successfully',
                user: loadedUser,
                accessToken: accessToken,
                refreshToken: refreshToken,
                status: 1
            });
        }
        else {
            const data = {
                userId: test.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
                login_count: 1
            };
            yield tokenModel_1.default.create(data);
            return res.status(200).json({
                message: 'Logged-in Successfully',
                user: loadedUser,
                accessToken: accessToken,
                refreshToken: refreshToken, status: 1
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.Login = Login;
const Logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const getToken = yield tokenModel_1.default.findOne({ where: { userId: userId } });
        if (getToken) {
            if (getToken.accessToken == null) {
                return res.json({ error: "User already Logged-out!", status: 0 });
            }
            else {
                getToken.accessToken = null;
                yield getToken.save();
                return res.status(200).json({ message: 'Logged-out Successfully', status: 1 });
            }
        }
        else {
            return res.json({ error: "Log-out Failed!", status: 0 });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.Logout = Logout;
const otpLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, status: 0 });
    }
    const country_code = req.body.country_code;
    const number = req.body.phone_number;
    try {
        const user = yield userModel_1.default.findOne({ where: { country_code: country_code, phone_number: number } });
        if (!user) {
            return res.status(400).json({ message: "User does not exist!", status: 0 });
        }
        user.is_active = 1;
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
                return res.status(200).json({
                    message: 'Logged-in Successfully',
                    user: loadedUser,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    status: 1
                });
            }
            else {
                const data = {
                    userId: user.id,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    login_count: 1
                };
                yield tokenModel_1.default.create(data);
                return res.status(200).json({
                    message: 'Logged-in Successfully',
                    user: loadedUser,
                    accessToken: accessToken,
                    refreshToken: refreshToken, status: 1
                });
            }
        }
        else {
            return res.status(400).json({ error: "Invalid OTP entered!", status: 0 });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.otpLogin = otpLogin;
const generateOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, status: 0 });
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
            return res.status(200).json({ message: "OTP sent Successfuly", status: 1 });
        }
        else {
            return res.status(400).json({ message: "Some error occured", status: 0 });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.generateOTP = generateOTP;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, status: 0 });
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
                user.is_verify = 1;
                yield user.save();
            }
            return res.status(200).json({ message: "Mobile number verified!", status: 1 });
        }
        else {
            return res.status(400).json({ message: "Invalid OTP entered!", status: 0 });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.verifyOTP = verifyOTP;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken || !(refreshToken in refreshTokens)) {
        return res.status(403).json({ error: "Invalid RefreshToken!", status: 0 });
    }
    jwt.verify(refreshToken, "somesupersuperrefreshsecret", (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        if (!err) {
            const token = jwt.sign({ user: user.loadedUser }, process.env.secret, { expiresIn: process.env.jwtExpiration });
            yield tokenModel_1.default.update({ token: token }, { where: { refreshToken: refreshToken } }).then(res => console.log(res)).catch(err => console.log(err));
            return res.status(201).json({ token, status: 1 });
        }
        else {
            return res.status(403).json({ error: "User not Authenticated!", status: 0 });
        }
    }));
});
exports.refreshToken = refreshToken;
const resetPasswordLink = (req, res) => {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, status: 0 });
    }
    try {
        crypto_1.default.randomBytes(32, (err, buffer) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(400).json({ message: "Some error occurred!", status: 0 });
            }
            const token = buffer.toString('hex');
            const user = yield userModel_1.default.findOne({ where: { email: req.body.email } });
            if (!user) {
                return res.status(400).json({ message: "No account found for this email!", status: 0 });
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
                return res.status(200).json({ message: 'Password reset link send to your email', status: 1 });
            }
            else {
                return res.status(400).json({ message: "Link generation failed!", status: 0 });
            }
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
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
            return res.status(400).json({ message: "Link is invalid", status: 0 });
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
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.getNewPassword = getNewPassword;
const postNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, check_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, status: 0 });
    }
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let resetUser;
    try {
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords does not match!', status: 0 });
        }
        const user = yield userModel_1.default.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [sequelize_1.Op.gt]: Date.now() },
                id: userId
            }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Link!', status: 0 });
        }
        resetUser = user;
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        resetUser.password = hashedPassword;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = null;
        yield resetUser.save();
        return res.status(200).json({ message: "Password Changed Successfully!", status: 1 });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
});
exports.postNewPassword = postNewPassword;
