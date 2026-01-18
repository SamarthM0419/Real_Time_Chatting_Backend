const jwt = require("jsonwebtoken");
const Auth = require("../models/authModel");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Token expired, please login" });
    }

    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedObj;

    const user = await Auth.findById(_id).select("-password");
    if (!user) {
      return res.status(404).json("message : User not Found");
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { userAuth };
