const amqp = require("amqplib");

let connection;
let channel;

const connectRabbitMQ = async () => {
  if (channel) return channel;

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange("events.exchange", "topic", {
      durable: true,
    });

    console.log("RabbitMQ connected (Request Service)");

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
};

module.exports = { connectRabbitMQ };
