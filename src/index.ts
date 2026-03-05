import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import * as z from "zod";
import {random} from "./utils.js"
import bcrypt from "bcrypt";
import {UserModel,ContentModel,LinkModel} from "./db.js"
import {userMiddleware} from "./middleware.js"
import {JWT_PASSWORD, PORT} from "./config.js"
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup",async  (req, res) => {
  //zod , hash the password
  const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
  });
  const username = req.body.username;
  const password = req.body.password;

  const parsed = schema.safeParse({ username, password });
  if (!parsed.success) {
    return res.status(400).json({ message: "Incorrect Inputs", errors: parsed.error });
  }
  const hashedPassword=await bcrypt.hash(password,10)

  try{await UserModel.create({
    username:username,
    password:hashedPassword
  })
  return res.json({
    message:"Signed up successfully from Real"
  })}catch(e){
    return res.status(409).json({
        message:"User already exists"
    })
  }
});

app.post("/api/v1/signin",async  (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, JWT_PASSWORD, { expiresIn: "1h" });
    return res.json({ token });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/v1/content",userMiddleware,async (req,res)=>{
    const link=req.body.link    
    const type=req.body.type   
    const title=req.body.title  
    const tags=req.body.tags
    //@ts-ignore  
    
    const userId=req.userId 
    console.log("jjjj")
    await ContentModel.create({
        link,
        type,
        title,
        tags:[],
        //@ts-ignore
        userId:userId
    })
    res.json({
        message:"Content added successfully"
    })
})

app.get("/api/v1/content",userMiddleware,async (req,res)=>{
  //@ts-ignore
  const userId=req.userId;
  const content =await ContentModel.find({
    userId:userId
  }).populate("userId","username")
  res.json({
    content
  })

})

app.delete("/api/v1/content",userMiddleware,async (req, res)=>{
   const contentId=req.body.contentId;
   try {
     const result = await ContentModel.deleteMany({
       _id: contentId,
       //@ts-ignore
       userId: req.userId
     });
     if (result.deletedCount === 0) {
       return res.status(404).json({ message: "Content not found or already deleted" });
     }
     return res.json({ message: "Content deleted successfully" });
   } catch (err) {
     console.error("Delete error:", err);
     return res.status(500).json({ message: "Failed to delete content" });
   }
})

app.post("/api/v1/hippo/share",userMiddleware,async (req,res)=>{
  const share=req.body.share;
  const hash=random(10);
  if(share){
    await LinkModel.create({
      
      //@ts-ignore
      userId:req.userId,
      hash:hash
    })
  }else{
    await LinkModel.deleteOne({
      //@ts-ignore
      userId:req.userId
    })
  }
  res.json({
    message:"Updated Shared Link",
    hash:hash
  })
  
})

app.get("/api/v1/hippo/:shareLink",async (req, res)=>{
  const hash=req.params.shareLink;
  const link=await LinkModel.findOne({
    hash
  })
  if(!link){
    res.status(411).json({
      message:"Link not found"
    })
    return;
  }
 
  const content=await ContentModel.findOne({
      userId:link.userId
  })
  const user=await UserModel.findOne({
    _id:link.userId
  })
  if(!user){
    res.status(411).json({
      message:"User not found"
    })
    return
  }
  res.json({
    content:content,
    usernaame:user.username
  })




})


app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
});

//what is regex
//elastic search vs vector embending 