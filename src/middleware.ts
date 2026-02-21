import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "./config.js"
import {NextFunction,Request,Response} from 'express';


export const userMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    // Authentication logic here
    const header=req.headers["autherization"];
    const decoded=jwt.verify(header as string ,JWT_PASSWORD);
    if(decoded){
        //@ts-ignore
        req.userId=decoded.userId;
        next();
    }else{
        res.status(403).json({message:"Invalid Token"});
    }

}