const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    message: {
      type: String,
      maxLength: 200,
      default: "Hi! Let's connect on chat.",
    },

    inviteSent: {
      type: Boolean,
      default: false,
    },

    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

requestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

requestSchema.methods.accept = function () {
  this.status = "accepted";
  return this.save();
};

requestSchema.methods.reject = function () {
  this.status = "rejected";
  return this.save();
};

module.exports = mongoose.model("Request", requestSchema);
