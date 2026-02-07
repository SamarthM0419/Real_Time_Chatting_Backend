const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const connectRequestDb = require("./config/requestDatabase");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

const requestRouter = require("./routes/request");

app.use("/", requestRouter);

connectRequestDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Request Service running on ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("Request DB Connection Failed", err.message));