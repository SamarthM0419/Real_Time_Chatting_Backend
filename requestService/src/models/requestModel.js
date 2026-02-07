const mongoose = require("mongoose");
const validator = require("validator");

const requestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      default: null,
    },
    targetEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address");
        }
      },
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
    emailSent: {
      type: Boolean,
      default: false,
    },
    inviteSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ fromUserId: 1, targetEmail: 1, status: 1 });

requestSchema.methods.isPending = function () {
  return this.status === "pending";
};

requestSchema.methods.acceptRequest = async function () {
  this.status = "accepted";
  return await this.save();
};

requestSchema.methods.rejectRequest = async function () {
  this.status = "rejected";
  return await this.save();
};

module.exports = mongoose.model("Request", requestSchema);