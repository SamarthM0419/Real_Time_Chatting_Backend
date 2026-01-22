const moongoose=require("mongoose")

const connectProfileDb=async()=>{
    try{
        await moongoose.connect(process.env.MONGO_PROFILE_URI);
        console.log("Profile Database Connected");
    }
    catch(err)
    {
        console.log("Could not connect to Profile Database",err.message);
    }
    };
module.exports=connectProfileDb;