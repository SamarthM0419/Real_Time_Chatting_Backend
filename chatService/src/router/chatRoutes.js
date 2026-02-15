const express = require("express");
const chatRouter = express.Router();
const { userAuth } = require("../middlewares/chatMiddleware");
const Connection = require("../models/connection");
const Chat = require("../models/chatModel");
const { redisClient } = require("../utils/redisClient");

chatRouter.post("/create-direct", userAuth, async (req, res) => {
  try {
    const senderId = req.user._id.toString();
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver ID required",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        message: "Cannot chat with yourself",
      });
    }

    const sorted = [senderId, receiverId].sort();
    const redisKey = `chat:allowed:${sorted[0]}:${sorted[1]}`;

    let allowed = await redisClient.get(redisKey);

    if (!allowed) {
      const connection = await Connection.findOne({
        users: sorted,
      });

      if (!connection) {
        return res.status(403).json({
          message: "Users are not connected",
        });
      }

      await redisClient.set(redisKey, "true");
    }

    const existingChat = await Chat.findOne({
      chatType: "direct",
      participants: { $all: sorted, $size: 2 },
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = await Chat.create({
      chatType: "direct",
      participants: sorted,
    });

    return res.status(201).json(newChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = chatRouter;
