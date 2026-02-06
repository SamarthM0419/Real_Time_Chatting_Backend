const { getChannel } = require("./connection");

const publishEvent = async (routingKey, message) => {
  const channel = getChannel();

  const payload = Buffer.from(JSON.stringify(message));

  channel.publish("events.exchange", routingKey, payload, {
    persistent: true, 
    contentType: "application/json",
  });
  
  console.log(`[EVENT PUBLISHED] ${routingKey}`, message);
};

module.exports = { publishEvent };
