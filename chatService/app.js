const express = require("express");
const connectChatDB = require("./src/config/chatDatabase");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

connectChatDB()
  .then(() => {
    app.listen(process.env.CHAT_SERVICE_PORT, () => {
      console.log(`Chat Service running on ${process.env.CHAT_SERVICE_PORT}`);
    });
  })
  .catch((err) => console.log("Chat DB Connection Failed", err.message));