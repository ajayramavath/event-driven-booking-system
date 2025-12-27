import mongoose, { Schema } from "mongoose"

const bookingIntentSchema = new Schema({
  userId: { type: String, require: true },
  intentId: { type: String, require: true, unique: true },
  amount: { type: String, require: true },
  eventPublishedAt: { type: String, require: true },
  status: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' }
}, {
  timestamps: true
})

export const BookingIntent = mongoose.model("BookingIntent", bookingIntentSchema);