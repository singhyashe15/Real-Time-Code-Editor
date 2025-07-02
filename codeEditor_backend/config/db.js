import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const url = process.env.MONGODB_URL

    await mongoose.connect(url)
    console.log("Connected");
  } catch (err) {
    console.log("Not connected " + err)
  }
}
