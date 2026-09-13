import connectDB from "./config/db.js";
import express from "express";
import roomROuter from "./Routes/roomRoutes.js";

const app=express();

connectDB();

app.use(express.json());

app.use("/api/rooms",roomROuter)


app.listen(3000,()=>{
    console.log("server started")
})