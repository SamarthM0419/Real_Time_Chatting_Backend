const validator = require("validator");

const validateRequestData = (req) => {
  const { targetEmail, message } = req.body;

  if (!targetEmail) {
    throw new Error("Target email is required");
  }

  if (!validator.isEmail(targetEmail)) {
    throw new Error("Invalid email address");
  }

  if (message && message.length > 200) {
    throw new Error("Message must be less than 200 characters");
  }
};

const validateRequestAction = (req) => {
  const { action } = req.body;

  if (!action) {
    throw new Error("Action is required");
  }

  if (!["accept", "reject"].includes(action)) {
    throw new Error("Action must be either 'accept' or 'reject'");
  }
};

module.exports = { validateRequestData, validateRequestAction };