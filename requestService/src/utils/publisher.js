const { getChannel } = require("./connection");

const publishEvent = async (routingKey, payload) => {
  try {
    const channel = getChannel();

    channel.publish(
      "events.exchange",
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );

    console.log(`Published event: ${routingKey}`);
  } catch (err) {
    console.error("Failed to publish event:", err.message);
  }
};

module.exports = { publishEvent };
