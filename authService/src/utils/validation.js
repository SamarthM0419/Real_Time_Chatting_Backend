const validator = require("validator");
const { validate } = require("../models/authModel");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Enter first and lastName");
  }

  if (firstName.length < 2 || lastName.length < 2) {
    throw new Error("Name must be at least 2 characters long");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("EmailId is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please Enter a Strong Password");
  }
};

module.exports = { validateSignUpData };
