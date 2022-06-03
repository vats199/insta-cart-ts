import User from "../models/userModel";
import Token from "../models/tokenModel";
import Stripe from "stripe"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { validationResult } from "express-validator/check";
import * as jwt from 'jsonwebtoken'
import { Request, Response } from "express";

let refreshTokens: any = {};

export const Signup = async (req: Request, res: Response) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        
      return res.status(400).json({message: errors.array()[0].msg, status: 0})
    }

    try {

        const userData = {
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
           if(process.env.secret != undefined && process.env.refSecret != undefined){

               const accessToken = jwt.sign(
                    { loadedUser },
                    process.env.secret,
                    { expiresIn: process.env.jwtExpiration }
                );
                const refreshToken = jwt.sign(
                    { loadedUser },
                    process.env.refSecret,
                    { expiresIn: process.env.jwtRefExpiration }
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