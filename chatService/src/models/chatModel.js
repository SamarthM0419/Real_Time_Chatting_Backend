const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },

    name: {
      type: String,
      trim: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
      },
    ],

    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatSchema);
