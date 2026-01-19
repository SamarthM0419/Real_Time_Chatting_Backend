const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const Auth = require("../models/authModel");
const authRouter = express.Router();
const validator = require("validator");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;

    const existingUser = await Auth.findOne({ emailId });
    if (existingUser) {
      return res.status(404).json({ message: "Email Already Present" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new Auth({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 3600000),
    });

    res
      .status(201)
      .json({ message: "User Registered Successfully", userId: user._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = authRouter;
