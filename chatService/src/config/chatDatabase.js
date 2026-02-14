const mongoose = require("mongoose");

const connectChatDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CHAT_URI);
    console.log("Chat Database Connected");
  } catch (err) {
    console.log("Couldn't connect to Chat database....", err.message);
  }
};

module.exports =  connectChatDb ;
