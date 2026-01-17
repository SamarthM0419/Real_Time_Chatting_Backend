const mongoose = require("mongoose");

const connectAuthDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_AUTH_URI);
    console.log("Auth Database Connected");
  } catch (err) {
    console.log("Couldn't connect to Auth database....", err.message);
  }
};

module.exports =  connectAuthDb ;
