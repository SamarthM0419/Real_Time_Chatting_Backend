const express = require("express");
const profileRouter = express.Router();
const Profile = require("../models/profileModel");
const { userAuth } = require("../middleware/profileMiddleware");
const { redisClient } = require("../utils/redis/redisClient");
const { uploadProfilePhoto, uploadProfilePhotoFromUrl } = require("../utils/cloudinary/uploadImage");

profileRouter.get("/getProfile", userAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const cacheKey = `profile:${userId}`;

    const cachedProfile = await redisClient.get(cacheKey);
    if (cachedProfile) {
      return res.status(200).json({
        data: JSON.parse(cachedProfile),
        source: "cache",
      });
    }

    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    await redisClient.set(cacheKey, JSON.stringify(profile), {
      EX: 600,
    });
    res.status(200).json({ data: profile, source: "database" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

profileRouter.patch("/patchProfile", userAuth, async (req, res) => {
  try {
    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "about",
      "profilePic",
      "gender",
      "age",
    ];

    const isUpdateAllowed = Object.keys(req.body).every((update) =>
      ALLOWED_UPDATES.includes(update),
    );

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    if (req.body.profilePic) {
      const { profilePic } = req.body;

      if (profilePic.startsWith("data:image")) {
        const cloudinaryUrl = await uploadProfilePhoto(
          profilePic,
          req.user._id,
        );
        req.body.profilePic = cloudinaryUrl;
      }

      else if (profilePic.startsWith("http://") || profilePic.startsWith("https://")) {
        const cloudinaryUrl = await uploadProfilePhotoFromUrl(
          profilePic,
          req.user._id,
        );
        req.body.profilePic = cloudinaryUrl;
      }

      else if (profilePic.includes("cloudinary.com")) {
      } else {
        throw new Error("Invalid profile picture format");
      }
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { returnDocument: "after", runValidators: true, upsert: true },
    );

    res
      .status(200)
      .json({ message: "Profile updated successfully", data: profile });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = profileRouter;
