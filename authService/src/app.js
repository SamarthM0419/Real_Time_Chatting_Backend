const express = require("express");
const connectAuthDB = require("./config/authDatabase");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");

app.use("/", authRouter);

connectAuthDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Auth Service running on ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("Auth DB Connection Failed", err.message));
