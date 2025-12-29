import mongoose, { Schema } from "mongoose";

const bookingIntentSchema = new Schema(
  {
    userId: String,
    intentId: String,
    amount: String,
    eventPublishedAt: String,
    status: String,
  },
  {
    collection: "bookingintents",
  }
);

export const BookingIntent = mongoose.model(
  "BookingIntent_Test",
  bookingIntentSchema
);
