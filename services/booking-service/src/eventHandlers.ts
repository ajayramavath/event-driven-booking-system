import { BookingIntent } from "./models/booking-intent";
import { publishEvent } from "./rabbit";
import { tracer } from ".";

export async function handleBookingIntentCreated(payload: any) {
  const { userId, intentId, amount } = payload;
  if (!userId || !intentId || !amount) {
    console.error("Incorrect Payload");
    return
  }
  tracer.startActiveSpan(
    "booking.on_intent_created",
    async (span) => {
      try {
        span.setAttribute("intentId", intentId)
        const intent = await BookingIntent.findOne({ intentId });
        if (!intent) {
          const bookingIntent = new BookingIntent({
            intentId: intentId,
            userId: userId,
            amount: amount,
            status: 'pending'
          });
          await bookingIntent.save();
          span.setAttribute("decision", "wait");
          span.end();
          return;
        }
        if (intent.status === "confirmed" || intent.status === "failed") {
          span.setAttribute("decision", "noop");
          span.end();
          return;
        }
        if (intent.status === "pending") {
          span.setAttribute("decision", "duplicate");
          span.end()
          return
        };
        if (intent && intent.status === "payment_received_first") {

          if (amount.toString() !== (intent.amount)?.toString()) {

            intent.status = "failed"
            await intent.save();

            span.setAttribute("decision", "failed");

            await publishEvent("booking.failed", {
              intentId: intentId,
              reason: "Amount Mismatch"
            })
            span.end();
            return;
          }

          intent.status = "confirmed";
          await intent.save();

          span.setAttribute("decision", "confirmed");

          await publishEvent("booking.confirmed", {
            intentId: intentId,
          })
          span.end();
        }
      } catch (err) {
        span.recordException(err as Error);
        span.setStatus({ code: 2 });
        span.end();
        throw err;
      }
    });
}

export async function handlePaymentCaptured(payload: any) {
  const { intentId, amount, userId } = payload;

  if (!userId || !intentId || !amount) {
    console.error("Incorrect Payload");
    return
  }

  return tracer.startActiveSpan(
    "booking.on_payment_captured",
    async (span) => {
      try {
        span.setAttribute("intentId", intentId)
        const intent = await BookingIntent.findOne({ intentId });
        if (!intent) {
          const bookingIntent = new BookingIntent({
            intentId: intentId,
            userId: userId,
            amount: amount,
            status: "payment_received_first"
          });
          await bookingIntent.save();
          span.setAttribute("decision", "wait");
          span.end();
          return
        }
        if (intent.status === "confirmed" || intent.status === "failed") {
          span.setAttribute("decision", "noop");
          span.end();
          return;
        }

        if (intent.status === "payment_received_first") {
          span.setAttribute("decision", "duplicate");
          span.end()
          return
        };

        if (intent.status === "pending") {
          if (amount.toString() !== (intent.amount)?.toString()) {
            intent.status = "failed"
            await intent.save();

            span.setAttribute("decision", "failed");

            await publishEvent("booking.failed", {
              intentId: intentId,
              reason: "Amount Mismatch"
            })
            span.end();
            return;
          }

          intent.status = "confirmed"
          await intent.save();

          span.setAttribute("decision", "confirmed");

          await publishEvent("booking.confirmed", {
            intentId: intentId,
          })
          span.end();
        }
      } catch (err) {
        span.recordException(err as Error);
        span.setStatus({ code: 2 });
        span.end();
        throw err;
      }
    })
}