const jwt = require("jsonwebtoken");
const cookie = require("cookie");

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
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const socketAuth = (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;

    if (!cookies) {
      return next(new Error("Unauthorized - No cookies"));
    }

    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.token;

    if (!token) {
      return next(new Error("Unauthorized - No token"));
    }

    const decodeObj = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decodeObj;

    next();
  } catch (err) {
    next(new Error("Unauthorized - Invalid or expired token"));
  }
};
module.exports = { userAuth, socketAuth };
