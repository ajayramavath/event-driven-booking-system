import mongoose from "mongoose";

export async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export async function initMongo() {
  const uri = "mongodb://localhost:27017/booking_service"

  for (let i = 0; i < 10; i++) {
    console.log(`Connecting to mongoose -- retry attempt ${i}`);
    try {
      await mongoose.connect(uri);
      console.log("Booking-Service Mongoose connected successfully");
      return;
    } catch (error) {
      console.log(`Error connecting to mongoose-${error}`);
      await sleep(2000);
    }
  }
} 