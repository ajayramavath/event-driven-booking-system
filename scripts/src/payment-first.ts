import axios from "axios";
import { sleep } from "bun";
import { BookingIntent } from "./models/bookingIntent";
import { initMongo } from "./db";


async function initScript() {
  console.log("Starting payment-first scenario");

  await initMongo()

  const userId = "u1"
  const bookingIntentAmount = "49900"
  const paymentCapturedAmount = "49900"
  const intentId = crypto.randomUUID();

  console.log("Sending request to /payment/captured endpoint");

  await axios.post("http://localhost:3002/payment/captured", {
    "intentId": intentId,
    "amount": paymentCapturedAmount,
    "userId": userId
  })

  await sleep(1500)

  console.log("Sending request to /booking/intent endpoint");

  await axios.post("http://localhost:3000/booking/intent",
    {
      "userId": userId,
      "amount": bookingIntentAmount,
      "intentId": intentId
    }
  )

  await sleep(1500)

  const intent = await BookingIntent.findOne({
    intentId
  }).lean()

  console.log(JSON.stringify(intent));

  if (intent?.status !== "confirmed") {
    throw new Error(`Expected confirmed, got ${intent?.status}`);
  }

  console.log("Payment first scenario passed");

  process.exit(0);
}

initScript();