const express = require("express");
const connectAuthDB = require("./config/authDatabase");
require("dotenv").config();
const cookieParser = require("cookie-parser");
// const cors = require("cors");
const { connectRabbitMQ } = require("../src/utils/rabbitMQ/connection");

const app = express();
app.set("trust proxy", 1);

// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "*",
//     credentials: true,
//   }),
// );

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");

app.use("/", authRouter);

(async () => {
  await connectRabbitMQ();
})();

connectAuthDB()
  .then(() => {
    app.listen(process.env.AUTH_SERVICE_PORT, () => {
      console.log(`Auth Service running on ${process.env.AUTH_SERVICE_PORT}`);
    });
  })
  .catch((err) => console.log("Auth DB Connection Failed", err.message));
