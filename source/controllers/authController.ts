import User from "../models/userModel";
import Token from "../models/tokenModel";
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { validationResult } from "express-validator/check";
import * as jwt from 'jsonwebtoken'
import { Request, Response } from "express";
import { Twilio } from 'twilio'
import * as mail from 'node-mailjet';
import { Op } from "sequelize";
import Stripe from "stripe";
import { globals,globalResponse } from '../util/const'
import { successResponse, errorResponse } from '../util/response'

const stripe = new Stripe(process.env.STRIPE_SK as string, { apiVersion: '2020-08-27' })
const mailjet = mail.connect(process.env.mjapi as string, process.env.mjsecret as string)

const client = new Twilio(process.env.accountSID as string, process.env.authToken as string)

let refreshTokens: any = {};

export const Signup = async (req: Request, res: Response) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){

      return errorResponse(res,globals.StatusBadRequest, errors.array()[0].msg, null)
    }

    try {

        const userData: any = {
            email: req.body.email,
            password: req.body.password
        }

        const test = await User.findOne({where: { email: req.body.email }})
        if(!test){
            bcrypt.hash(req.body.password, 10, async(err: any,hash: any) =>{
                if(err){
                    console.log(err);
                    return errorResponse(res,globals.StatusBadRequest, globalResponse.Error, null)
                }
                userData.password = hash

                const customer = await stripe.customers.create({
                    email: req.body.email,
                    description: 'Insta-Cart Customer!'
                })

                userData.stripe_id = customer.id
                const user = await User.create(userData)
                const resp = await User.findByPk(user.id, { attributes: {exclude: ['password']} })

                return successResponse(res, globals.StatusCreated, globalResponse.RegistrationSuccess, resp)
                
            })
        }else {
            return errorResponse(res,globals.StatusBadRequest, globalResponse.UserExist, null)
          }
        
    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }

}

export const Login = async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return errorResponse(res,globals.StatusBadRequest, errors.array()[0].msg, null)
    }
    try {
        const test = await User.findOne({where: { email: req.body.email }})
        if(!test || test == null || test == undefined){
            return errorResponse(res,globals.StatusNotFound, globalResponse.UserNotFound, null)
        }

        
        
        const passCheck = await bcrypt.compare(req.body.password, test.password)
        
        if(!passCheck){
            return errorResponse(res,globals.StatusBadRequest, globalResponse.InvalidCredentials, null)
        }
        test.is_active = true;
        await test.save()
        const loadedUser = await User.findByPk(test.id,{attributes:{exclude: ['password']}})

               const accessToken = jwt.sign(
                    { loadedUser },
                    process.env.secret as string,
                    { expiresIn: process.env.jwtExpiration as string }
                );
                const refreshToken = jwt.sign(
                    { loadedUser },
                    process.env.refSecret as string,
                    { expiresIn: process.env.jwtRefExpiration as string }
                );
           

            refreshTokens[refreshToken] = { accessToken: accessToken, refreshToken: refreshToken }
            
            const getToken = await Token.findOne({ where: { userId: test.id } })
                if (getToken) {
                getToken.login_count += 1;
                getToken.accessToken = accessToken;
                getToken.refreshToken = refreshToken;

                await getToken.save();

                const data: any = {}
                data.accessToken = accessToken
                data.refreshToken = refreshToken;
                data.user = loadedUser 

                return successResponse(res, globals.StatusOK, globalResponse.LoginSuccess, data)
                } else {
                const payload = {
                    userId: test.id,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    login_count: 1
                }
                await Token.create(payload)
                const data: any = {}
                data.accessToken = accessToken
                data.refreshToken = refreshToken;
                data.user = loadedUser 

                return successResponse(res, globals.StatusOK, globalResponse.LoginSuccess, data)
                }
        
    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const Logout = async (req: any, res: Response) => {
    const userId = req.user.id;
    try {
        const getToken = await Token.findOne({ where: { userId: userId } });
        const user: any = await User.findByPk(userId);
    
        if (getToken) {
          if (getToken.accessToken == null) {
            return errorResponse(res,globals.StatusBadRequest, globalResponse.AlreadyLoggedOut, null)
          } else {
    
            getToken.accessToken = null;
            user.is_active = false;

            await user.save();
    
            await getToken.save();
            return successResponse(res, globals.StatusOK, globalResponse.LogoutSuccess, null)
          }
        } else {
            return errorResponse(res,globals.StatusBadRequest, globalResponse.Error, null)
        }
      } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
      }
}

export const otpLogin = async(req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return errorResponse(res,globals.StatusBadRequest, errors.array()[0].msg, null)
    }

    const country_code = req.body.country_code;
    const number = req.body.phone_number;

    try {

        const user =  await User.findOne({ where: { country_code: country_code, phone_number: number } })
        
        if(!user){
            return errorResponse(res,globals.StatusNotFound, globalResponse.UserNotFound, null)
        }
        user.is_active = true;
        await user.save()
        const loadedUser = await User.findByPk(user.id,{attributes:{exclude: ['password']}})

        const otp = await client.verify
                                .services(process.env.serviceID as string)
                                .verificationChecks
                                .create({
                                    to: `${country_code}${number}`,
                                    code: req.body.otpValue
                                  });
        
        if(otp.valid == true){


                const accessToken = jwt.sign(
                     { loadedUser },
                     process.env.secret as string,
                     { expiresIn: process.env.jwtExpiration as string}
                 );
                 const refreshToken = jwt.sign(
                     { loadedUser },
                     process.env.refSecret as string,
                     { expiresIn: process.env.jwtRefExpiration as string }
                 );
            
 
             refreshTokens[refreshToken] = { accessToken: accessToken, refreshToken: refreshToken }
             
             const getToken = await Token.findOne({ where: { userId: user.id } })
                 if (getToken) {
                 getToken.login_count += 1;
                 getToken.accessToken = accessToken;
                 getToken.refreshToken = refreshToken;
 
                 await getToken.save();
 
                 const data: any = {}
                data.accessToken = accessToken
                data.refreshToken = refreshToken;
                data.user = loadedUser 

                return successResponse(res, globals.StatusOK, globalResponse.LoginSuccess, data)
                 } else {
                 const payload = {
                     userId: user.id,
                     accessToken: accessToken,
                     refreshToken: refreshToken,
                     login_count: 1
                 }
                 await Token.create(payload)
                 const data: any = {}
                data.accessToken = accessToken
                data.refreshToken = refreshToken;
                data.user = loadedUser 

                return successResponse(res, globals.StatusOK, globalResponse.LoginSuccess, data)
                 }
                 
        } else {
            return errorResponse(res,globals.StatusBadRequest, globalResponse.InvalidOTP, null)
        }

    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const generateOTP = async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return errorResponse(res,globals.StatusBadRequest, errors.array()[0].msg, null)
    }

    const country_code = req.body.country_code;
    const number = req.body.phone_number;
    try {
        
        const otp = await client.verify
                                .services(process.env.serviceID as string)
                                .verifications
                                .create({
                                    to: `${country_code}${number}`,
                                    channel: req.body.channel
                                })

        if(otp.status == 'pending'){
            return successResponse(res, globals.StatusOK, globalResponse.OtpSent, null)
        }else{
            return errorResponse(res,globals.StatusBadRequest, globalResponse.Error, null)
        }

    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const verifyOTP = async (req: any, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return errorResponse(res,globals.StatusBadRequest, errors.array()[0].msg, null)
    }

    const country_code = req.body.country_code;
    const number = req.body.phone_number;
    const userId = req.user.id;

    try {

        const otp = await client.verify
                                .services(process.env.serviceID as string)
                                .verificationChecks
                                .create({
                                    to: `${country_code}${number}`,
                                    code: req.body.otpValue
                                })
        if(otp.valid == true){
            const user = await User.findByPk(userId)
            if(user){
                user.country_code = country_code || user.country_code
                user.phone_number = number || user.phone_number
                user.is_verify = true;

                await user.save();
            }
            return successResponse(res, globals.StatusOK, globalResponse.OtpVerified, null)
        }else{
            return errorResponse(res,globals.StatusBadRequest, globalResponse.InvalidOTP, null)
        }
        
    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
  if (!refreshToken || !(refreshToken in refreshTokens)) {
    return errorResponse(res,globals.StatusBadRequest, globalResponse.InvalidRefreshToken, null)
  }
  jwt.verify(refreshToken, "somesupersuperrefreshsecret", async(err: any, user: any) => {
    if (!err) {
      const accessToken = jwt.sign(
        { user: user.loadedUser },
        process.env.secret as string,
        { expiresIn: process.env.jwtExpiration as string }
      );
      await Token.update({ accessToken: accessToken }, { where: { refreshToken: refreshToken } }).then(res => console.log(res)).catch(err => console.log(err))

      return successResponse(res, globals.StatusOK, globalResponse.RenewAccessToken, accessToken)
    } else {
        return errorResponse(res, globals.StatusUnauthorized, globalResponse.Unauthorized, null)
    }
  })
}

export const resetPasswordLink = (req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return errorResponse(res,globals.StatusBadRequest, errors.array()[0].msg, null)
    }

    try {
        crypto.randomBytes(32, async(err: any, buffer: any)=>{
            if(err){
                return errorResponse(res,globals.StatusBadRequest, globalResponse.Error, null)
            }
            const token = buffer.toString('hex')
            const user = await User.findOne({where: { email: req.body.email }});
    
            if(!user){
                return errorResponse(res,globals.StatusNotFound, globalResponse.UserNotFound, null)
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            await user.save();

            const link = await mailjet.post("send", { 'version': 'v3.1' })
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
                                    
    
            if(link){
                return successResponse(res, globals.StatusOK, globalResponse.ResetPasswordLinkSent, null)
            }else{
                return errorResponse(res,globals.StatusBadRequest, globalResponse.Error, null)
            }
    
        
        })
        
    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const getNewPassword = async(req: Request, res: Response) => {
    const token = req.params.token;

    try {

        const user = await User.findOne({
            where: {
              resetToken: token,
              resetTokenExpiration: { [Op.gt]: Date.now() }
            }
          })

          if(!user){
            return errorResponse(res,globals.StatusNotAcceptable, globalResponse.InvalidResetLink, null)
          }

          res.render('auth/new-password', {
              path: '/new-password',
              pageTitle: 'New Password',
              userId: user.id,
              passwordToken: token
          })
        
    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}

export const postNewPassword = async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return errorResponse(res,globals.StatusBadRequest, errors.array()[0].msg, null)
    }
    
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let resetUser;

    try {
        
        if(newPassword !== confirmPassword) {
            return errorResponse(res,globals.StatusBadRequest, globalResponse.DiffPasswords, null)
        }

        const user = await User.findOne({
            where: {
              resetToken: token,
              resetTokenExpiration: { [Op.gt]: Date.now() },
              id: userId
            }
          })

        if(!user){
            return errorResponse(res,globals.StatusBadRequest, globalResponse.InvalidResetLink, null)
        }

        resetUser = user;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        resetUser.password = hashedPassword;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = null;

        await resetUser.save()

        return successResponse(res, globals.StatusOK, globalResponse.PasswordChanged, null)

    } catch (error) {
        console.log(error);
        return errorResponse(res, globals.StatusInternalServerError, globalResponse.ServerError, null);
    }
}