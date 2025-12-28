import mongoose, { Schema } from "mongoose"

const bookingIntentSchema = new Schema({
  userId: { type: String, require: true },
  intentId: { type: String, require: true, unique: true },
  amount: { type: String, require: true },
  eventPublishedAt: { type: String, require: true },
  status: { type: String, enum: ['pending', 'confirmed', 'failed', "payment_received_first"], default: 'pending' }
}, {
  timestamps: true
})

export const BookingIntent = mongoose.model("BookingIntent", bookingIntentSchema);