const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token Expired, please login again" });
    }

    const decodeObj = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodeObj;

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { userAuth };