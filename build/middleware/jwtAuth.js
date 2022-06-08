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
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtAuth = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const jwtAuth = (req, res, next) => {
    let token = req.get("Authorization");
    if (token != undefined) {
        token = token.split(' ')[1];
        if (process.env.secret != undefined) {
            jwt.verify(token, process.env.secret, (err, user) => {
                if (!err) {
                    if (user && token) {
                        req.user = user.loadedUser;
                        req.token = user.token;
                        // console.log(user)
                    }
                    next();
                }
            });
        }
    }
    else {
        return res.status(403).json({ error: "User not Authenticated", status: 0 });
    }
};
exports.jwtAuth = jwtAuth;
