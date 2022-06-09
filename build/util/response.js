"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.failureResponse = exports.successResponse = void 0;
const const_1 = require("./const");
const successResponse = (res, status_code, message, data) => {
    res.status(status_code).json({ message: message, data: data, status: const_1.globals.Success });
};
exports.successResponse = successResponse;
const failureResponse = (res, status_code, message, data) => {
    res.status(status_code).json({ message: message, data: data, status: const_1.globals.Failed });
};
exports.failureResponse = failureResponse;
const errorResponse = (res, status_code, ErrorMessage, data) => {
    res.status(status_code).json({ message: ErrorMessage, data: data, status: const_1.globals.Failed });
};
exports.errorResponse = errorResponse;
