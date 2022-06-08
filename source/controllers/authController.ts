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

const stripe = new Stripe(process.env.STRIPE_SK as string, { apiVersion: '2020-08-27' })
const mailjet = mail.connect(process.env.mjapi as string, process.env.mjsecret as string)

const client = new Twilio(process.env.accountSID as string, process.env.authToken as string)

let refreshTokens: any = {};

export const Signup = async (req: Request, res: Response) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return res.status(400).json({message: errors.array()[0].msg, status: 0})
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
                    return res.status(400).json({message: "Error occured in incrypting password", status: 0})
                }
                userData.password = hash

                const customer = await stripe.customers.create({
                    email: req.body.email,
                    description: 'Insta-Cart Customer!'
                })

                userData.stripe_id = customer.id
                const user = await User.create(userData)
                const resp = await User.findByPk(user.id, { attributes: {exclude: ['password']} })
                
                return res.status(200).json({message: "Registration successful", userData: resp, status: 1})
            })
        }else {
            return res.json({ error: "USER ALREADY EXISTS", status: 0 })
          }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }

}

export const Login = async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return res.status(400).json({message: errors.array()[0].msg, status: 0})
    }
    try {
        const test = await User.findOne({where: { email: req.body.email }})
        if(!test || test == null || test == undefined){
            return res.status(200).json({message: "User does not exist!", status: 0})
        }

        
        
        const passCheck = await bcrypt.compare(req.body.password, test.password)
        
        if(!passCheck){
            return res.status(400).json({ error: 'Invalid Email or Password!', status: 0 })
        }
        test.is_active = 1;
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

                return res.status(200).json({
                    message: 'Logged-in Successfully',
                    user: loadedUser,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    status: 1
                })
                } else {
                const data = {
                    userId: test.id,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    login_count: 1
                }
                await Token.create(data)
                return res.status(200).json({
                    message: 'Logged-in Successfully',
                    user: loadedUser,
                    accessToken: accessToken,
                    refreshToken: refreshToken, status: 1
                })
                }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const Logout = async (req: any, res: Response) => {
    const userId = req.user.id;
    try {
        const getToken = await Token.findOne({ where: { userId: userId } })
    
        if (getToken) {
          if (getToken.accessToken == null) {
            return res.json({ error: "User already Logged-out!", status: 0 })
          } else {
    
            getToken.accessToken = null;
    
            await getToken.save();
            return res.status(200).json({ message: 'Logged-out Successfully', status: 1 })
          }
        } else {
          return res.json({ error: "Log-out Failed!", status: 0 })
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
      }
}

export const otpLogin = async(req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return res.status(400).json({message: errors.array()[0].msg, status: 0})
    }

    const country_code = req.body.country_code;
    const number = req.body.phone_number;

    try {

        const user =  await User.findOne({ where: { country_code: country_code, phone_number: number } })
        
        if(!user){
            return res.status(400).json({message: "User does not exist!", status:0})
        }
        user.is_active = 1;
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
 
                 return res.status(200).json({
                     message: 'Logged-in Successfully',
                     user: loadedUser,
                     accessToken: accessToken,
                     refreshToken: refreshToken,
                     status: 1
                 })
                 } else {
                 const data = {
                     userId: user.id,
                     accessToken: accessToken,
                     refreshToken: refreshToken,
                     login_count: 1
                 }
                 await Token.create(data)
                 return res.status(200).json({
                     message: 'Logged-in Successfully',
                     user: loadedUser,
                     accessToken: accessToken,
                     refreshToken: refreshToken, status: 1
                 })
                 }
                 
        } else {
        return res.status(400).json({ error: "Invalid OTP entered!", status: 0 })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const generateOTP = async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return res.status(400).json({message: errors.array()[0].msg, status: 0})
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
            return res.status(200).json({ message: "OTP sent Successfuly", status: 1 });
        }else{
            return res.status(400).json({message: "Some error occured", status: 0})
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const verifyOTP = async (req: any, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return res.status(400).json({message: errors.array()[0].msg, status: 0})
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
                user.is_verify = 1;

                await user.save();
            }
            return res.status(200).json({ message: "Mobile number verified!", status: 1});
        }else{
            return res.status(400).json({ message: "Invalid OTP entered!", status: 0})
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
  if (!refreshToken || !(refreshToken in refreshTokens)) {
    return res.status(403).json({ error: "Invalid RefreshToken!", status: 0 })
  }
  jwt.verify(refreshToken, "somesupersuperrefreshsecret", async(err: any, user: any) => {
    if (!err) {
      const token = jwt.sign(
        { user: user.loadedUser },
        process.env.secret as string,
        { expiresIn: process.env.jwtExpiration as string }
      );
      await Token.update({ token: token }, { where: { refreshToken: refreshToken } }).then(res => console.log(res)).catch(err => console.log(err))
      return res.status(201).json({ token, status: 1 });
    } else {
      return res.status(403).json({ error: "User not Authenticated!", status: 0 })
    }
  })
}

export const resetPasswordLink = (req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return res.status(400).json({message: errors.array()[0].msg, status: 0})
    }

    try {
        crypto.randomBytes(32, async(err: any, buffer: any)=>{
            if(err){
                return res.status(400).json({message: "Some error occurred!", status: 0})
            }
            const token = buffer.toString('hex')
            const user = await User.findOne({where: { email: req.body.email }});
    
            if(!user){
                return res.status(400).json({message: "No account found for this email!", status: 0})
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
                return res.status(200).json({message: 'Password reset link send to your email', status: 1});
            }else{
                return res.status(400).json({message: "Link generation failed!", status: 0})
            }
    
        
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
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
              return res.status(400).json({message: "Link is invalid", status: 0})
          }

          res.render('auth/new-password', {
              path: '/new-password',
              pageTitle: 'New Password',
              userId: user.id,
              passwordToken: token
          })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}

export const postNewPassword = async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return res.status(400).json({message: errors.array()[0].msg, status: 0})
    }
    
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let resetUser;

    try {
        
        if(newPassword !== confirmPassword) {
            return res.status(400).json({message: 'Passwords does not match!', status: 0})
        }

        const user = await User.findOne({
            where: {
              resetToken: token,
              resetTokenExpiration: { [Op.gt]: Date.now() },
              id: userId
            }
          })

        if(!user){
            return res.status(400).json({ message: 'Invalid Link!', status: 0 });
        }

        resetUser = user;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        resetUser.password = hashedPassword;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = null;

        await resetUser.save()

        return res.status(200).json({ message: "Password Changed Successfully!", status: 1})

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error || 'Something went wrong!', status: 0 });
    }
}