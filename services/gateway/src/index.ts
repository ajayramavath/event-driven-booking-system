import Fastify from "fastify";
import { initRabbit, publishEvent } from "./rabbit";

const app = Fastify({
  logger: true,
});



app.get("/health", () => {
  return { status: "ok" };
});

app.post('/booking/intent', async (req, reply) => {
  const body = req.body as {
    userId: string;
    amount: number;
  };

  await publishEvent('booking.intent.created', {
    intentId: crypto.randomUUID(),
    userId: body.userId,
    amount: body.amount,
    createdAt: new Date().toISOString(),
  });

  return {
    message: 'booking intent received (stub)',
  };
});

async function start() {
  await initRabbit();
  await app.listen({ port: 3000, host: '0.0.0.0' }).catch(err => {
    app.log.error(err);
    process.exit(1);
  });
}

start();

