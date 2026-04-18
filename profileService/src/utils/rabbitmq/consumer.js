const { getChannel } = require("./connection");

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

        console.log("Auth user created, profile will be completed on first save:", userId);

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
