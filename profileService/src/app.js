const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());

const profileRouter = require("./routes/profile");

const connectProfileDb = require("./config/profileDatabase");

app.use("/", profileRouter);

connectProfileDb().then(() => {
    console.log("Database connection established for Profile Service.");

    app.use("/", profileRouter);

    app.listen(5001, () => {
      console.log("Profile Service is listening on port 5001");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected");
    console.error(err);
  });