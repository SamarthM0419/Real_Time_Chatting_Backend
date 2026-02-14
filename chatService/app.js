const express = require("express");
const connectChatDB = require("./src/config/chatDatabase");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

connectChatDB()
  .then(() => {
    server.listen(process.env.CHAT_SERVICE_PORT, () => {
      console.log(`Chat Service running on ${process.env.CHAT_SERVICE_PORT}`);
    });
  })
  .catch((err) => console.log("Chat DB Connection Failed", err.message));
