const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const Auth = require("../models/authModel");
const authRouter = express.Router();
const validator = require("validator");
const { loginLimiter, userAuth } = require("../middleware/authMiddleware");
const { publishEvent } = require("../utils/rabbitMQ/publisher");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;

    const existingUser = await Auth.findOne({ emailId });
    if (existingUser) {
      return res.status(404).json({ message: "Email Already Exists" });
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

    try {
      await publishEvent("auth.user.created", {
        userId: savedUser._id.toString(),
        email: savedUser.emailId,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        createdAt: savedUser.createdAt,
      });
    } catch (err) {
      console.error("Event publish failed", err.message);
    }

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res
      .status(201)
      .json({ message: "User Registered Successfully", userId: user._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/login", loginLimiter, async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId) || !emailId || !password) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const user = await Auth.findOne({ emailId });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not Found, Signup to continue" });
    }

    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = await user.getJWT();
    
    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "lax",
      path: "/", 
    });

    res.status(200).json({
      data: {
        id: user._id,
        emailId: user.emailId,
        token: token,
      },
      message: "User login successful!!!",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).json({ message: "Logout Successful" });
});

authRouter.patch("/changePassword", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new passwords are required" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "New password must be different" });
    }

    const user = await Auth.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();

    await user.save();

    res.status(200).json({
      message: "Password updated successfully. Please login again.",
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error: " + err.message,
    });
  }
});

authRouter.get("/getUserByEmail", async (req, res) => {
  try {
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({ message: "emailId is required" });
    }

    const user = await Auth.findOne({ emailId: emailId.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ userId: user._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = authRouter;
