import { initMongo, sleep } from "./db"
import fs from "fs"
import { BookingIntent } from "./models/bookingIntent";

async function initScript() {
  console.log("Starting booking-service-recovery verification");

  if (!fs.existsSync("./.last-intent.json")) {
    throw new Error("Missing .last-intent.json (run booking-service-down first)");
  }

  const { intentId } = JSON.parse(fs.readFileSync("./.last-intent.json", "utf-8"));

  if (!intentId) {
    throw new Error("Invalid intentId in state file");
  }

  await initMongo();

  const start = Date.now();

  while (Date.now() - start < 15_000) {
    const intent = await BookingIntent.findOne({
      intentId
    })

    console.log(intent)

    if (intent && (intent.status == "confirmed" || intent.status == "failed")) {
      console.log("Recovery successful");
      console.log({
        intentId,
        status: intent.status,
        amount: intent.amount,
      });

      if (!intent.amount) {
        throw new Error("Invariant violation: amount missing");
      }

      console.log("All invariants satisfied");
      process.exit(0);
    }

    console.log("Waiting for booking-service to converge...");
    await sleep(1000);
  }

  throw new Error(
    `Recovery timeout: booking did not reach terminal state within ${15000} ms`
  );

}

initScript()