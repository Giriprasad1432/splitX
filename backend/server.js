import "dotenv/config";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import roomROuter from "./Routes/roomRoutes.js";

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomROuter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});