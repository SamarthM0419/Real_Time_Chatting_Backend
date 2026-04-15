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
    },
    file: {
      data: { type: String },        // base64-encoded file content
      name: { type: String },
      mimeType: { type: String },
      size: { type: Number },
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
