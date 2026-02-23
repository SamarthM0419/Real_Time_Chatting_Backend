const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.ObjectId,
      ref: "Auth",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
      },
    ],
  },
  { timestamps: true },
);

messageSchema.index({ chatId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
