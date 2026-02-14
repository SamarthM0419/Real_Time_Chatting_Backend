const express = require("express");
const connectChatDB = require("./config/chatDatabase");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { connectRedis } = require("./utils/redisClient");
const { connectRabbitMQ } = require("./utils/connection");
const { consumeRequestAccepted } = require("./utils/consumer");

const app = express();
app.set("trust proxy", 1);

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

async function startChatService() {
  try {

    await connectChatDB();

    await connectRedis();

    const channel = await connectRabbitMQ();

    await consumeRequestAccepted(channel);

    server.listen(process.env.CHAT_SERVICE_PORT, () => {
      console.log(
        `Chat Service running on ${process.env.CHAT_SERVICE_PORT}`
      );
    });

  } catch (err) {
    console.error("Failed to start Chat Service:", err);
  }
}

startChatService();
