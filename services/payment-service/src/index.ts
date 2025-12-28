import Fastify from "fastify"
import { initRabbit, publishEvent } from "./rabbit";

const app = Fastify({
  logger: true
})

app.get("/health", () => {
  return { satus: "ok" };
})

app.post("/payment/captured", async (req, res) => {
  const body = req.body as {
    intentId: string,
    userId: string,
    amount: number
  }

  await publishEvent("payment.captured", {
    intentId: body.intentId,
    userId: body.userId,
    amount: body.amount
  })

  return {
    message: 'payment capture received (stub)',
  };
})

async function start() {
  await initRabbit()
  await app.listen({ port: 3002, host: "0.0.0.0" }).catch(err => {
    console.error(`Payment Service Startup failed ${err}`)
  })
}

start()