const { getChannel } = require("./connection");
const Profile = require("../../models/profileModel");

async function consumeAuthUserCreated() {
  const channel = getChannel();

  const QUEUE_NAME = "profile.auth.user.created";

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
  });

  await channel.bindQueue(QUEUE_NAME, "events.exchange", "auth.user.created");

  console.log("Listening to auth.user.created events");

  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());

        const { userId, email, firstName, lastName } = data;

        const existingProfile = await Profile.findOne({ userId });

        if (existingProfile) {
          console.log("Profile already exists:", userId);
          channel.ack(msg);
          return;
        }

        await Profile.create({
          userId,
          email,
          firstName,
          lastName,
        });

        console.log("Profile created for user:", userId);

        channel.ack(msg);
      } catch (err) {
        console.error("Failed to process auth.user.created", err.message);
      }
    },
    {
      noAck: false,
    },
  );
}

module.exports = {
  consumeAuthUserCreated,
};
