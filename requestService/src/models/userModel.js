const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
  },

  emailId: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email Adddress");
      }
    },
  },
  firstName: {
    type: String,
  },
  lastName: { type: String },
  createdAt: Date,
});

module.exports = mongoose.model("UserSchema", UserSchema);
