const express = require("express");
const connectAuthDB = require("./config/authDatabase");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

const connectProfileDb = require("./config/profileDatabase");

app.use("/", authRouter);
app.use("/", profileRouter);

connectAuthDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Auth Service running on ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("Auth DB Connection Failed", err.message));

connectProfileDb();



