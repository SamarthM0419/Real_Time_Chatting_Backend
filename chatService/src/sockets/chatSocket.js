const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const { socketAuth } = require("../middlewares/chatMiddleware");

module.exports = function initializeSocket(io) {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("User Connected: ", socket.user._id);

    socket.on("joinChat", async ({ chatId }) => {
      try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
          return socket.emit("error", "Chat not found");
        }

        const isParticipant = chat.participants.some(
          (id) => id.toString() === socket.user._id.toString()
        );

        if (!isParticipant) {
          return socket.emit("error", "Not authorized");
        }

        socket.join(chatId);
        console.log(`User ${socket.user._id} joined ${chatId}`);
      } catch (err) {
        console.error("Join error: ", err);
      }
    });

socket.on("sendMessage", async ({ chatId, text }) => {
  try {
    if (!text) return;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log("Chat not found");
      return;
    }

    const isParticipant = chat.participants.some(
      (id) => id.toString() === socket.user._id.toString()
    );

    if (!isParticipant) {
      console.log("Not authorized to send message");
      return;
    }

    const message = await Message.create({
      chatId,
      senderId: socket.user._id,   
      text,
      readBy: [socket.user._id]
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });

    console.log("Message saved:", message.text);

    io.to(chatId).emit("receiveMessage", message);

  } catch (err) {
    console.error("Send message error:", err);
  }
});

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user._id);
    });
  });
};
