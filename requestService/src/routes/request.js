const express = require("express");
const requestRouter = express.Router();
const Request = require("../models/requestModel");
const { userAuth } = require("../middleware/requestMiddleware");
const validator = require("validator");

requestRouter.post("/send", userAuth, async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const fromUserId = req.user._id;

    if (!targetEmail) {
      return res.status(400).json({ message: "targetEmail is required" });
    }

    if (!validator.isEmail(targetEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existingRequest = await Request.findOne({
      fromUserId,
      targetEmail,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Request already sent to this email" });
    }

    let toUserId = null;
    let userExists = false;

    try {
      const response = await fetch(
        `${process.env.AUTH_SERVICE_URL}/getUserByEmail?emailId=${targetEmail}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        const data = await response.json();
        toUserId = data.userId;
        userExists = true;
      } else {
        console.log(
          `[RequestService] User with email ${targetEmail} not found. Invite flow to be implemented.`,
        );
      }
    } catch (fetchErr) {
      console.log(
        `[RequestService] Could not reach Auth Service: ${fetchErr.message}`,
      );
    }

    const request = new Request({
      fromUserId,
      toUserId,
      targetEmail,
      status: "pending",
    });

    const savedRequest = await request.save();

    res.status(201).json({
      message: userExists
        ? "Request sent successfully"
        : "User not found on platform. Request saved — will be delivered when they join.",
      data: savedRequest,
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
    });

    res.status(200).json({ data: requests });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

requestRouter.get("/sent", userAuth, async (req, res) => {
  try {
    const requests = await Request.find({
      fromUserId: req.user._id,
    });

    res.status(200).json({ data: requests });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


requestRouter.patch("/respond/:requestId", userAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { requestId } = req.params;

    if (!["accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'accepted' or 'rejected'" });
    }

    const request = await Request.findOne({
      _id: requestId,
      toUserId: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found or already responded" });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: `Request ${status} successfully`,
      data: request,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


requestRouter.post("/userCreated", async (req, res) => {
  try {
    const { userId, emailId } = req.body;

    if (!userId || !emailId) {
      return res
        .status(400)
        .json({ message: "userId and emailId are required" });
    }

    const result = await Request.updateMany(
      {
        targetEmail: emailId.toLowerCase(),
        toUserId: null,
        status: "pending",
      },
      {
        $set: { toUserId: userId },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[RequestService] USER_CREATED: Updated ${result.modifiedCount} pending request(s) for ${emailId}`
      );
    }

    res.status(200).json({
      message: `Updated ${result.modifiedCount} pending request(s)`,
      updated: result.modifiedCount,
    });
  } catch (err) {
    console.error("[RequestService] Error in userCreated:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = requestRouter;