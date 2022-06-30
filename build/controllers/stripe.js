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
exports.checkout = exports.getCards = exports.addCard = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const cardModel_1 = __importDefault(require("../models/cardModel"));
const paymentModel_1 = __importDefault(require("../models/paymentModel"));
const stripe_1 = __importDefault(require("stripe"));
const const_1 = require("../util/const");
const response_1 = require("../util/response");
const stripe = new stripe_1.default(process.env.STRIPE_SK, {
    apiVersion: "2020-08-27",
});
const addCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findByPk(req.user.id);
        const exp = req.body.expire.split("/");
        const exp_month = exp[0];
        const exp_year = exp[1];
        const cardInfo = yield stripe.customers.createSource(user.stripe_id, {
            source: {
                object: "card",
                number: req.body.number,
                exp_month: exp_month,
                exp_year: exp_year,
                cvc: req.body.cvc,
                name: req.body.name,
            },
        });
        const save = yield cardModel_1.default.create({
            card_id: cardInfo.id,
            userId: req.user.id,
        });
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.CardSaved, save);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.addCard = addCard;
const getCards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findByPk(req.user.id);
        const cards = yield stripe.customers.listSources(user.stripe_id, {
            object: "card",
        });
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.CardsFetched, cards);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.getCards = getCards;
const checkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findByPk(req.user.id);
        const amount = req.body.amount;
        if (!user.stripe_id) {
            return (0, response_1.errorResponse)(res, const_1.globals.StatusBadRequest, const_1.globalResponse.StripeError, null);
        }
        const cardInfo = yield stripe.customers.retrieveSource(user.stripe_id, req.body.card_id);
        const intent = yield stripe.paymentIntents.create({
            payment_method_types: ["card"],
            description: "Pay for Insta-Cart",
            receipt_email: user.email,
            amount: parseFloat(amount) * 100,
            currency: "usd",
            customer: user.stripe_id,
            payment_method: cardInfo.id,
        });
        const paym = yield paymentModel_1.default.create({
            amount: parseFloat(amount),
            userId: req.user.id,
            transaction_id: intent.client_secret,
            status: "PENDING",
        });
        const data = {};
        data.client_secret = intent.client_secret;
        data.customerId = intent.customer;
        return (0, response_1.successResponse)(res, const_1.globals.StatusOK, const_1.globalResponse.PaymentIntentCreated, data);
    }
    catch (error) {
        console.log(error);
        return (0, response_1.errorResponse)(res, const_1.globals.StatusInternalServerError, const_1.globalResponse.ServerError, null);
    }
});
exports.checkout = checkout;
