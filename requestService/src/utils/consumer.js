const UserSchema = require("../models/userModel");

const consumeAuthUserCreated = async (channel) => {
  const EXCHANGE = "events.exchange";
  const QUEUE = "request.auth.user.created";
  const ROUTING_KEY = "auth.user.created";

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  console.log("Listening for auth.user.created events");

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());

      await UserSchema.updateOne(
        { userId: event.userId },
        {
          userId: event.userId,
          email: event.email.toLowerCase(),
          firstName: event.firstName,
          lastName: event.lastName,
          createdAt: event.createdAt,
        },
        { upsert: true },
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Failed to consume auth.user.created", err);
    }
  });
};

module.exports = { consumeAuthUserCreated };
