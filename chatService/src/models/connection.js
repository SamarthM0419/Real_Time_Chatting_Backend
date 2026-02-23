const mongoose = require("mongoose")

const connectionSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted"],
      default: "accepted",
    },
  },
  { timestamps: true }
);

connectionSchema.index(
  { user1: 1, user2: 1 },
  { unique: true }
);

module.exports = mongoose.model("Connection", connectionSchema);