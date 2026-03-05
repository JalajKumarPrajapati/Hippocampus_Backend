import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";

mongoose.connect(MONGODB_URI)

const UserSchema=new mongoose.Schema({
    username:{ type: String, required: true },
    password:{ type: String, required: true } 
})
export const UserModel=mongoose.model("users",UserSchema)

const ContentSchema= new mongoose.Schema({
    link:String,
    type:String,
    title:String,
    tags:[{type:mongoose.Types.ObjectId,ref:'Tag'}],
    userId:{type:mongoose.Types.ObjectId,ref:'users',requires:true},
})
export const ContentModel=mongoose.model('content',ContentSchema)


const tag_s=new mongoose.Schema({
    title:String,
})

const LinkSchema=new mongoose.Schema({
    userId:{type: mongoose.Types.ObjectId,ref:'User',required:true,unique:true},
    hash:String
})
export const LinkModel=mongoose.model("Links",LinkSchema)
export const TagModel=mongoose.model("Tag",tag_s)