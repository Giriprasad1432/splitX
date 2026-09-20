import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/splitx";
        await mongoose.connect(mongoURI);

        console.log(`MongoDB connected: ${process.env.MONGO_URI ? "Atlas" : "Local"}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;