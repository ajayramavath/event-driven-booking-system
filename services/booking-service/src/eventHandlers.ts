import { BookingIntent } from "./models/booking-intent";

export async function handleBookingIntentCreated(payload: any) {
  const { userId, intentId, amount } = payload;
  if (!userId || !intentId || !amount) {
    console.error("Incorrect Payload");
    return
  }
  const intent = await BookingIntent.findOne({ intentId });

  if (intent && intent.status === "pending") return;

  if (intent && intent.status === "payment_received_first") {
    intent.status = "confirmed";
    await intent.save();
    return
  }

  const bookingIntent = new BookingIntent({
    intentId: intentId,
    userId: userId,
    amount: amount,
    status: 'pending'
  });
  await bookingIntent.save();
}

export async function handlePaymentCaptured(payload: any) {
  const { intentId, amount, userId } = payload;

  if (!userId || !intentId || !amount) {
    console.error("Incorrect Payload");
    return
  }
  const intent = await BookingIntent.findOne({ intentId });

  if (!intent) {
    const bookingIntent = new BookingIntent({
      intentId: intentId,
      userId: userId,
      amount: amount,
      status: "payment_received_first"
    });
    await bookingIntent.save();
    return
  }

  if (intent.status === "pending") {
    intent.status = "confirmed"
    await intent.save()
  }
}