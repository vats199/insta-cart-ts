import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { globals,globalResponse } from '../util/const';
import { errorResponse } from '../util/response';

export const jwtAuth = (req: any, res: Response, next: NextFunction) =>{
    let token = req.get("Authorization");
    if(token != undefined){
        token = token.split(' ')[1];
        
        if(process.env.secret != undefined) {
            
            jwt.verify(token, process.env.secret, (err: any,user: any)=>{
                
                if(!err){
                    if(user && token){
                        req.user = user.loadedUser;
                        req.token = user.token;
                        // console.log(user)
                    }
                    next(); 
                }
            })
        }
    }else{
        return errorResponse(res, globals.StatusUnauthorized, globalResponse.Unauthorized, null)
    }
}