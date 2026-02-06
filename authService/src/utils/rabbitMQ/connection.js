const amqp = require("amqplib");

let connection;
let channel;

async function createRabbitMQ() {
  if (channel) {
    return channel;
  }

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertExchange("events.exchange", "topic", {
      durable: true,
    });

    console.log("RabbitMQ successfully connected");

    process.on("SIGINT", async () => {
      if (channel) await channel.close();
      if (connection) await connection.close();
      process.exit(0);
    });

    return channel;
  } catch (err) {
    console.error("RabbitMQ connection failed", err);
    process.exit(1);
  }
}

function getChannel() {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel not initialized. Call connectRabbitMQ() first.",
    );
  }
  return channel;
}

module.exports = {
  createRabbitMQ,
  getChannel,
};
