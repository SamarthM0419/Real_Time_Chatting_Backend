const publishEvent = async (channel, routingKey, payload) => {
  try {
    channel.publish(
      "events.exchange",
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );

    console.log(`Published event: ${routingKey}`);
  } catch (err) {
    console.error("Failed to publish event:", err.message);
  }
};

module.exports = { publishEvent };
