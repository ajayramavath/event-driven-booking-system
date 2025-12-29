import axios from "axios";
import { sleep } from "bun";
import { BookingIntent } from "./models/bookingIntent";
import { initMongo } from "./db";


async function initScript() {
  console.log("Starting duplicate-events scenario");

  await initMongo()

  const userId = "u1"
  const bookingIntentAmount = "49900"
  const paymentCapturedAmount = "100"
  const intentId = crypto.randomUUID();

  console.log("Sending request to /booking/intent endpoint");

  await axios.post("http://localhost:3000/booking/intent",
    {
      "userId": userId,
      "amount": bookingIntentAmount,
      "intentId": intentId
    }
  )

  await sleep(1000)

  console.log("Sending request to /booking/intent endpoint again with same intentId");

  await axios.post("http://localhost:3000/booking/intent",
    {
      "userId": userId,
      "amount": bookingIntentAmount,
      "intentId": intentId
    }
  )

  await sleep(1000)

  console.log("Sending request to /payment/captured endpoint");

  await axios.post("http://localhost:3002/payment/captured", {
    "intentId": intentId,
    "amount": paymentCapturedAmount,
    "userId": userId
  })

  await sleep(1000)

  console.log("Sending request to /payment/captured endpoint again with same intentId");

  await axios.post("http://localhost:3002/payment/captured", {
    "intentId": intentId,
    "amount": paymentCapturedAmount,
    "userId": userId
  })

  await sleep(1000)

  const intents = await BookingIntent.find({
    intentId: intentId
  }).lean()


  if (intents.length > 1 || intents.length == 0) {
    throw new Error(`Expected exactly one intent, got ${intents.length}`);
  }

  console.log("Duplicate-events passed");

  process.exit(0);
}

initScript();