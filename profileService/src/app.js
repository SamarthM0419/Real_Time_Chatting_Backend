const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());
const { connectRabbitMQ } = require("./utils/rabbitmq/connection");
const { consumeAuthUserCreated } = require("./utils/rabbitmq/consumer");
const profileRouter = require("./routes/profile");

const connectProfileDb = require("./config/profileDatabase");

app.use("/", profileRouter);

async function startProfileService() {
  try {
    await connectProfileDb();

    await connectRabbitMQ();

    await consumeAuthUserCreated();

    require("./config/cloudinaryConfig");

    app.listen(process.env.PROFILE_SERVICE_PORT, () => {
      console.log(`Profile Service running on ${process.env.PROFILE_SERVICE_PORT}`);
    });
  } catch (err) {
    console.error("Profile Service startup failed", err);
    process.exit(1);
  }
}

startProfileService();
