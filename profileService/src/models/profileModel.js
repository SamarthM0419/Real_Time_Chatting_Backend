const mongoose = require("mongoose");
const validator = require("validator");
const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      minLength: 2,
    },
    lastName: {
      type: String,
      minLength: 1,
    },
    about: {
      type: String,
      default: "Hey there! I am using this chat app.",
      maxLength: 750,
    },
    profilePic: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL for profile picture");
        }
      },
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other","Male","Female"],
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Profile", profileSchema);
