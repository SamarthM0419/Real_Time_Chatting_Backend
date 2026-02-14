const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["accepted"],
      default: "accepted",
    },
  },
  { timestamps: true }
);

connectionSchema.index({ users: 1 }, { unique: true });

module.exports = mongoose.model("Connection", connectionSchema);
