import "./telemetry"
import Fastify from "fastify"
import { initRabbit, publishEvent, startConsuming } from "./rabbit";
import { trace } from '@opentelemetry/api';

const app = Fastify({
  logger: true
})

const tracer = trace.getTracer("payment-service");

app.get("/health", () => {
  return { satus: "ok" };
})

app.post("/payment/captured", async (req, res) => {
  const body = req.body as {
    intentId: string,
    userId: string,
    amount: number
  }

  await tracer.startActiveSpan("payment.captured", async (span) => {
    try {
      span.setAttribute("intentId", body.intentId)
      await publishEvent("payment.captured", {
        intentId: body.intentId,
        userId: body.userId,
        amount: body.amount
      })
      span.end()
    } catch (error) {
      span.recordException(error as Error)
      span.end()
      throw error
    }
  })

  return {
    message: 'payment capture received (stub)',
  };
})

async function start() {
  await initRabbit()
  await startConsuming("payment-events", [
    "booking.confirmed",
    "booking.failed"
  ])
  await app.listen({ port: 3002, host: "0.0.0.0" }).catch(err => {
    console.error(`Payment Service Startup failed ${err}`)
  })
}

start()