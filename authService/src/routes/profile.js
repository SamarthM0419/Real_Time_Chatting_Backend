const express=require("express");
const profileRouter=express.Router();
const Profile=require("../models/profileModel");
const {userAuth}=require("../middleware/authMiddleware");

profileRouter.get("/getProfile",userAuth, async(req,res)=>{
    try{
        const profile=await Profile.findOne({userId: req.user._id});

        if(!profile){
            return res.status(404).json({message: "Profile not found"});
        }
        res.status(200).json({data:profile});
    }
    
    catch(err){
        res.status(400).json({message: err.message});
    }
        });

        profileRouter.patch("/patchProfile",userAuth, async(req, res)=>{
            try {
                const ALLOWES_UPDATES=["firstName","lastName","about","profilePic","gender"];
                const isUpdateAllowed=Object.keys(req.body).every((update)=> ALLOWES_UPDATES.includes(update));

                if(!isUpdateAllowed){
                    throw new Error("Update not allowed");
                }

                const profile=await Profile.findOneAndUpdate({userId: req.user._id},
                    req.body,
                    {returnDocument: "after", runValidators:true, upsert: true}
                );

                res.status(200).json({message: "Profile updated successfully", data:profile,});
            }
            catch(err){
                res.status(400).json({message:err.message});
            }
            
        });
        module.exports=profileRouter;
    
        

