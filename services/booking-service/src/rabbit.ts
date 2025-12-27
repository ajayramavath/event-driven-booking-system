import amqp, { type ConsumeMessage } from 'amqplib';
import { BookingIntent } from './models/booking-intent';

let channel: amqp.Channel | null = null;

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function initRabbit() {
  const url = "amqp://rabbitmq:5672";

  for (let i = 0; i <= 10; i++) {
    try {
      const conn = await amqp.connect(url);
      channel = await conn.createChannel();
      channel.assertExchange("events", "topic", { durable: true })
      console.log("Rabbit mq connected in booking-service");
      return conn;
    } catch (error) {
      console.log(error);
      await sleep(2000);
    }
  }

  console.error("Error connectting to rabbitmq in booking-service");
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
      const payload = JSON.parse(message.content.toString());
      console.log(`Booking event with payload ${JSON.stringify(payload)} received`);
      await handleEvent(message);
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
    case "booking.intent.created":
      await handleBookingIntentCreated(payload);
      return
    default:
      console.log(`Event with payload ${payload} received`);
      return;
  }
}

async function handleBookingIntentCreated(payload: any) {
  const { userId, intentId, amount } = payload;
  if (!userId || !intentId || !amount) {
    console.error("Incorrect Payload");
    return
  }
  const bookingIntent = new BookingIntent({
    intentId: intentId,
    userId: userId,
    amount: amount,
    status: 'pending'
  });
  await bookingIntent.save();
}




