import "./telemetry";
import Fastify from "fastify";
import { initRabbit, publishEvent } from "./rabbit";
import { trace } from "@opentelemetry/api";

const app = Fastify({
  logger: true,
});
const tracer = trace.getTracer("gateway");
app.get("/health", () => {
  return { status: "ok" };
});

app.post('/booking/intent', async (req, reply) => {

  const body = req.body as {
    userId: string;
    amount: number;
  };

  const intentId = crypto.randomUUID();

  await tracer.startActiveSpan("gateway.booking.intent", async (span) => {
    try {
      span.setAttribute("intentId", intentId)

      await publishEvent('booking.intent.created', {
        intentId,
        userId: body.userId,
        amount: body.amount,
        createdAt: new Date().toISOString(),
      });

      span.end()
    } catch (error) {
      span.recordException(error as Error)
      span.end()
      throw error;
    }
  })

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

