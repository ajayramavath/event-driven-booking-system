import Fastify from "fastify";
import { initRabbit, startConsuming } from "./rabbit";
import { initMongo } from "./mongoose";

const app = Fastify({
  logger: true,
})

app.get("/health", () => {
  return { status: "ok" };
})

async function start() {
  await initRabbit();
  await initMongo();
  await startConsuming("booking-events", [
    "booking.intent.created",
    "payment.captured"
  ])
  await app.listen({ port: 3001, host: '0.0.0.0' }).catch(err => {
    console.error(err)
  })
}

start();