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
      required: true,
      minLength: 1,
    },
    about: {
      type: String,
      required: true,
      maxLength: 750,
    },
    profilePic: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL for profile picture");
        }
      },
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other", "Male", "Female"],
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Profile", profileSchema);
