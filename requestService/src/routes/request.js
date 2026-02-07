const express = require("express");
const requestRouter = express.Router();
const Request = require("../models/requestModel");
const { userAuth } = require("../middleware/requestMiddleware");
const validator = require("validator");

requestRouter.post("/request", userAuth, async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const currentUserId = req.user._id;

    if (!targetEmail) {
      return res.status(400).json({ message: "targetEmail is required" });
    }

    if (!validator.isEmail(targetEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    let targetUserId = null;

    try {
      const response = await fetch(
        `${process.env.AUTH_SERVICE_URL}/getUserByEmail?emailId=${targetEmail}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        targetUserId = data.userId;
      } else {
        return res.status(404).json({
          message: "User with this email doesn't exist",
        });
      }
    } catch (fetchErr) {
      return res.status(500).json({
        message: "Could not reach Auth Service",
        error: fetchErr.message,
      });
    }

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        message: "You cannot send a request to yourself",
      });
    }

    const existingConnection = await Request.findOne({
      $or: [
        { fromUserId: currentUserId, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: currentUserId },
      ],
      status: "accepted",
    });

    if (existingConnection) {
      return res.status(400).json({
        message: "You are already connected with this user",
      });
    }

    const outgoingRequest = await Request.findOne({
      fromUserId: currentUserId,
      toUserId: targetUserId,
      status: "pending",
    });

    if (outgoingRequest) {
      return res.status(400).json({
        message: "You already have a pending request to this user",
      });
    }

    const incomingRequest = await Request.findOne({
      fromUserId: targetUserId,
      toUserId: currentUserId,
      status: "pending",
    });

    if (incomingRequest) {
      return res.status(400).json({
        message:
          "You have a pending request from this user. Use PATCH /request/requestId to respond",
        requestId: incomingRequest._id,
      });
    }

    const newRequest = new Request({
      fromUserId: currentUserId,
      toUserId: targetUserId,
      targetEmail: targetEmail.toLowerCase(),
      status: "pending",
    });

    await newRequest.save();

    return res.status(201).json({
      message: "Request sent successfully",
      data: newRequest,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

requestRouter.patch("/request/:requestId", userAuth, async (req, res) => {
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

    const request = await Request.findOne({
      _id: requestId,
      toUserId: currentUserId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found or already responded",
      });
    }

    request.status = status;
    await request.save();

    return res.status(200).json({
      message: `Request ${status} successfully`,
      data: request,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

requestRouter.get("/sent", userAuth, async (req, res) => {
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

requestRouter.get("/received", userAuth, async (req, res) => {
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