import { context, propagation } from '@opentelemetry/api';
import amqp, { type ConsumeMessage } from 'amqplib';

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
  const headers: Record<string, any> = {};
  propagation.inject(context.active(), headers);
  channel.publish(
    'events',
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    { headers, persistent: true }
  );
  console.log("Event published:", routingKey, payload);
}

export async function startConsuming(queueName: string, routingKeys: string[]) {
  if (!channel) {
    console.error("Channel is null");
    return;
  }

  await channel.assertQueue(queueName, { durable: true });

  for (const routingKey of routingKeys) {
    await channel.bindQueue(queueName, "events", routingKey);
  }

  await channel.consume(queueName, async (message: ConsumeMessage | null) => {
    if (!message) return null;
    try {
      const ctx = propagation.extract(
        context.active(),
        message.properties.headers
      )
      const payload = JSON.parse(message.content.toString());
      console.log(`Booking event with payload ${JSON.stringify(payload)} received`);
      context.with(ctx, async () => {
        await handleEvent(message);
      })
      channel?.ack(message);
    } catch (error) {
      console.error(`Error processing event: ${error}`);
      channel?.nack(message, false, true);
    }
  })
}

export async function handleEvent(message: ConsumeMessage) {
  const routingKey = message.fields.routingKey;
  const payload = JSON.parse(message.content.toString());

  switch (routingKey) {
    case "booking.confirmed":
      console.log("Booking Confirmed Acknowledged")
      return
    case "booking.failed":
      console.log("Refund Initiated");
      return
    default:
      console.log(`Event with payload ${payload} received`);
      return;
  }
}