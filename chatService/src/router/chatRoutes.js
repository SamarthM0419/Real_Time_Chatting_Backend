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

    if (!receiverId)
      return res.status(400).json({ message: "Receiver ID required" });

    if (senderId === receiverId)
      return res.status(400).json({ message: "Cannot chat with yourself" });

    const sorted = [senderId, receiverId].sort();
    const redisKey = `chat:allowed:${sorted[0]}:${sorted[1]}`;

    let allowed = await redisClient.get(redisKey);

    if (!allowed) {
      const connection = await Connection.findOne({
        user1: sorted[0],
        user2: sorted[1],
      });

      if (!connection)
        return res.status(403).json({ message: "Users are not connected" });

      await redisClient.set(redisKey, "true", { EX: 3600 });
    }

    const existingChat = await Chat.findOne({
      chatType: "direct",
      participants: { $all: sorted, $size: 2 },
    });

    if (existingChat) return res.status(200).json(existingChat);

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

chatRouter.post("/create-group", userAuth, async (req, res) => {
  try {
    const senderId = req.user._id.toString();
    const { name, participants } = req.body;

    if (!name || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ message: "Group name and participants array are required" });
    }

    if (participants.length < 2) {
      return res.status(400).json({ message: "A group must have at least 2 other participants" });
    }

    const uniqueParticipants = [...new Set([...participants, senderId])];

    const newGroupChat = await Chat.create({
      chatType: "group",
      name: name.trim(),
      participants: uniqueParticipants,
      admins: [senderId],
    });

    return res.status(201).json(newGroupChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

chatRouter.put("/add-to-group", userAuth, async (req, res) => {
  try {
    const requesterId = req.user._id.toString(); 
    const { chatId, userIdToAdd } = req.body;

    if (!chatId || !userIdToAdd) {
      return res.status(400).json({ message: "Chat ID and User ID to add are required" });
    }

    const chat = await Chat.findOne({ _id: chatId, chatType: "group" });

    if (!chat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!chat.admins.includes(requesterId)) {
      return res.status(403).json({ message: "Only admins can add users to this group" });
    }

    if (chat.participants.includes(userIdToAdd)) {
      return res.status(400).json({ message: "User is already in the group" });
    }

    chat.participants.push(userIdToAdd);
    await chat.save();

    return res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

chatRouter.put("/remove-from-group", userAuth, async (req, res) => {
  try {
    const requesterId = req.user._id.toString(); 
    const { chatId, userIdToRemove } = req.body;

    if (!chatId || !userIdToRemove) {
      return res.status(400).json({ message: "Chat ID and User ID to remove are required" });
    }

    const chat = await Chat.findOne({ _id: chatId, chatType: "group" });

    if (!chat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!chat.admins.includes(requesterId)) {
      return res.status(403).json({ message: "Only admins can remove users from this group" });
    }

    if (requesterId === userIdToRemove) {
      return res.status(400).json({ message: "Use the /leave-group route to leave the chat" });
    }

    chat.participants = chat.participants.filter(id => id.toString() !== userIdToRemove);
    chat.admins = chat.admins.filter(id => id.toString() !== userIdToRemove);

    await chat.save();

    return res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

chatRouter.put("/leave-group", userAuth, async (req, res) => {
  try {
    const requesterId = req.user._id.toString();
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }

    const chat = await Chat.findOne({ _id: chatId, chatType: "group" });

    if (!chat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!chat.participants.includes(requesterId)) {
      return res.status(400).json({ message: "You are not a participant in this group" });
    }

    chat.participants = chat.participants.filter(id => id.toString() !== requesterId);
    chat.admins = chat.admins.filter(id => id.toString() !== requesterId);

    if (chat.participants.length === 0) {
      await Chat.findByIdAndDelete(chatId);
      return res.status(200).json({ message: "Group deleted because there are no participants left" });
    }

    await chat.save();

    return res.status(200).json({ message: "Successfully left the group", chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = chatRouter;