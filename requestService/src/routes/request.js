const express = require("express");
const requestRouter = express.Router();
const Request = require("../models/requestModel");
const { userAuth } = require("../middleware/requestMiddleware");

requestRouter.post("/invite/send", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toEmail } = req.body;

    if (!toEmail) {
      return res.status(400).json({ message: "toEmail is required" });
    }

    const targetUser = await UserSchema.findOne({
      email: toEmail.toLowerCase(),
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    const toUserId = targetUser.userId;

    if (fromUserId.equals(toUserId)) {
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

    res.status(201).json({
      message: "Invite sent successfully",
      data,
    });
    console.log(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    const requests = await Request.find({
      fromUserId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Sent requests retrieved successfully",
      data: requests,
      count: requests.length,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

requestRouter.get("/invites/received", userAuth, async (req, res) => {
  try {
    const requests = await Request.find({
      toUserId: req.user._id,
      status: "pending",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Received requests retrieved successfully",
      data: requests,
      count: requests.length,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = requestRouter;
