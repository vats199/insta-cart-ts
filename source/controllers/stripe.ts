import User from "../models/userModel";
import card from "../models/cardModel";
import payment from "../models/paymentModel";
import { Request, Response } from 'express'
import Stripe from "stripe";
import { globals, globalResponse } from '../util/const'
import { successResponse, errorResponse } from "../util/response";

const stripe = new Stripe(process.env.STRIPE_SK as string, { apiVersion: '2020-08-27' })

export const addCard = async (req: any, res: Response) => {

    try {

        const user: any = await User.findByPk(req.user.id);

        const exp = req.body.expire.split('/');

        const exp_month = exp[0];
        const exp_year = exp[1];

        const cardInfo = await stripe.customers.createSource(user.stripe_id, {
            source: {
                'object': 'card',
                'number': req.body.number,
                'exp_month': exp_month,
                'exp_year': exp_year,
                'cvc': req.body.cvc,
                'name': req.body.name
            } as any
        });

        const save = await card.create({card_id: cardInfo.id, userId: req.user.id});

        return successResponse(res, globals.StatusOK, globalResponse.CardSaved, save)

        
    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }

}

export const getCards = async (req:any, res: Response) => {
    try {

        const user: any = await User.findByPk(req.user.id);

        const cards = await stripe.customers.listSources(user.stripe_id, {
            object: 'card'
        });

        return successResponse(res, globals.StatusOK, globalResponse.CardsFetched, cards)
        
    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const checkout = async (req: any, res: Response) => {
    try {

        const user: any = await User.findByPk(req.user.id);

        const amount = req.body.amount;

        if(!user.stripe_id){
            return errorResponse(res, globals.StatusBadRequest, globalResponse.StripeError, null)
        }

        const cardInfo = await stripe.customers.retrieveSource(user.stripe_id,req.body.card_id)
        
        const intent = await stripe.paymentIntents.create({
            payment_method_types: ['card'],
            description: 'Pay for Insta-Cart',
            receipt_email: user.email,
            amount: parseFloat(amount)*100,
            currency: 'usd',
            customer : user.stripe_id,
            payment_method: cardInfo.id
        })

        const paym = await payment.create({
            amount: parseFloat(amount),
            userId: req.user.id,
            transaction_id: intent.client_secret,
            status: 'PENDING'
        })

        const data: any = {}
        data.client_secret = intent.client_secret
        data.customerId = intent.customer

        return successResponse(res, globals.StatusOK, globalResponse.PaymentIntentCreated, data)

    } catch (error) {
        console.log(error);
        return errorResponse(res,globals.StatusInternalServerError, globalResponse.ServerError, null)
    }
}