import axios from "axios";
import { sleep } from "bun";
import fs from "fs";
import { initMongo } from "./db";


async function initScript() {
  console.log("Starting booking-service-down scenario");

  await initMongo()

  const userId = "u1"
  const bookingIntentAmount = "49900"
  const paymentCapturedAmount = "49900"

  console.log("Sending request to /booking/intent endpoint");

  const res = await axios.post("http://localhost:3000/booking/intent",
    {
      "userId": userId,
      "amount": bookingIntentAmount
    }
  )

  const response = res.data as {
    message: string,
    intentId: string,
    amount: string,
    userId: string
  }
  console.log("Raw /booking/intent response:", res.data);

  await sleep(1500)

  console.log("Sending request to /payment/captured endpoint");

  await axios.post("http://localhost:3002/payment/captured", {
    "intentId": response.intentId,
    "amount": paymentCapturedAmount,
    "userId": userId
  })

  await sleep(1500)

  fs.writeFileSync(
    "./.last-intent.json",
    JSON.stringify({ intentId: response.intentId })
  );
  console.log("IntentId written to the file");

  console.log("booking-service-down scenario completed");

  process.exit(0);
}

initScript().catch((err) => {
  console.error("Recovery verification failed");
  console.error(err.message);
  process.exit(1);
});