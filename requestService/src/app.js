const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const connectRequestDb = require("./config/requestDatabase");
const { connectRabbitMQ } = require("./utils/connection");
const { consumeAuthUserCreated } = require("./utils/consumer");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

const requestRouter = require("./routes/request");

app.use("/", requestRouter);

async function startRequestService() {
  try {
    await connectRequestDb();

    const channel = await connectRabbitMQ();
    
    await consumeAuthUserCreated(channel);

    app.listen(process.env.PORT, () => {
      console.log(
        `Request Service running on ${process.env.REQUEST_SERVICE_PORT}`,
      );
    });
  } catch (err) {
    console.error("Request Service startup failed", err);
    process.exit(1);
  }
}

startRequestService();
