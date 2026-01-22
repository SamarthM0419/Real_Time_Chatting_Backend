const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());

const profileRouter = require("./routes/profile");

const connectProfileDb = require("./config/profileDatabase");

app.use("/", profileRouter);

connectProfileDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Profile Service running on ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("Profile DB Connection Failed", err.message));
