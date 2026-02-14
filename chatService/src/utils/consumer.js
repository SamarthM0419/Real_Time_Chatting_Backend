const { redisClient } = require("../utils/redisClient");

const consumeRequestAccepted = async (channel) => {
  const EXCHANGE = "events.exchange";
  const QUEUE = "chat.request.accepted";
  const ROUTING_KEY = "request.accepted";

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  console.log("Listening for request.accepted events...");

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      const { fromUserId, toUserId } = event;

      const sorted = [fromUserId, toUserId].sort();
      const key = `chat:allowed:${sorted[0]}:${sorted[1]}`;

      await redisClient.set(key, "true");

      console.log("Allowed chat stored:", key);

      channel.ack(msg);
    } catch (err) {
      console.error("Error processing request.accepted:", err);
    }
  });
};

module.exports = { consumeRequestAccepted };
