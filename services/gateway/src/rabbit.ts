import amqp from 'amqplib';

let channel: amqp.Channel | null = null;

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function initRabbit() {
  const url = "amqp://rabbitmq:5672";

  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      console.log(`Connecting to RabbitMQ (attempt ${attempt})...`);
      const conn = await amqp.connect(url);
      channel = await conn.createChannel();

      await channel.assertExchange("events", "topic", { durable: true });

      console.log("RabbitMQ connected");
      return;
    } catch (err) {
      console.error("RabbitMQ not ready yet");
      await sleep(2000);
    }
  }

  throw new Error("Failed to connect to RabbitMQ after retries");
}

export async function publishEvent(routingKey: string, payload: any) {
  if (!channel) throw new Error('Rabbit not initialized');
  channel.publish(
    'events',
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  );
  console.log("Event published:", routingKey, payload);
}