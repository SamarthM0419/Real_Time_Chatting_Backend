const express = require("express");
const requestRouter = express.Router();
const Request = require("../models/requestModel");
const { userAuth } = require("../middleware/requestMiddleware");
const UserSchema = require("../models/userModel");
const { redisClient } = require("../utils/redisClient");

requestRouter.post("/invite/send", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toEmail } = req.body;

    if (!toEmail) {
      return res.status(400).json({ message: "toEmail is required" });
    }

    const normalizedEmail = toEmail.trim().toLowerCase();

    const targetUser = await UserSchema.findOne({
      email: normalizedEmail,
    });
    console.log(targetUser);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!targetUser.userId) {
      return res.status(500).json({ message: "User data not synced yet" });
    }

    const toUserId = targetUser.userId;

    if (String(fromUserId) === String(toUserId)) {
      return res
        .status(400)
        .json({ message: "You cannot send request to yourself" });
    }

    const existingInvite = await Request.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingInvite) {
      return res.status(400).json({ message: "Invite request already exists" });
    }

    const data = await Request.create({
      fromUserId,
      toUserId,
      status: "pending",
    });

    return res.status(201).json({
      message: "Invite sent successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

requestRouter.patch("/respond/:requestId", userAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const currentUserId = req.user._id;

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "status must be 'accepted' or 'rejected'",
      });
    }

    const request = await Request.findOneAndUpdate(
      {
        _id: requestId,
        toUserId: currentUserId,
        status: "pending",
      },
      { status },
      { new: true },
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found or already responded",
      });
    }

    return res.status(200).json({
      message: `Request ${status} successfully`,
      data: request,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

requestRouter.get("/invites/sent", userAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const cacheKey = `sentRequest:${userId}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        data: JSON.parse(cachedData),
        source: "cache",
      });
    }

    const requests = await Request.find({
      fromUserId: req.user._id,
    }).sort({ createdAt: -1 });

    const responseData = {
      message: "Sent requests retrieved successfully",
      data: requests,
      count: requests.length,
    };

    await redisClient.set(cacheKey, JSON.stringify(responseData), {
      Ex: 600,
    });

    res.status(200).json({
      ...responseData,
      source: "database",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

requestRouter.get("/invites/received", userAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const cacheKey = `recievedRequest:${userId}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: JSON.parse(cachedData),
        source: "cache",
      });
    }

    const requests = await Request.find({
      toUserId: req.user._id,
      status: "pending",
    }).sort({ createdAt: -1 });

    const responseData = {
      message: "Receieved requests retrieved successfully",
      data: requests,
      count: requests.length,
    };

    await redisClient.set(cacheKey, JSON.stringify(responseData), {
      Ex: 600,
    });

    res.status(200).json({
      ...responseData,
      source: "database",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

requestRouter.delete(
  "/cancel/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.user._id.toString();

      const request = await Request.findById(requestId);

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      if (request.fromUserId.toString() !== userId) {
        return res.status(403).json({
          message: "You are not allowed to cancel this request",
        });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          message: "Only pending requests can be cancelled",
        });
      }

      await request.deleteOne();


      await redisClient.del(`sentRequests:${userId}`);
      await redisClient.del(
        `receivedRequests:${request.toUserId.toString()}`
      );

      res.status(200).json({
        message: "Request cancelled successfully",
      });

    } catch (err) {
      res.status(400).json({
        message: err.message,
      });
    }
  }
);


module.exports = requestRouter;
