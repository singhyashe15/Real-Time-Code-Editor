import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userModel from "./models/user.js";
import authRouter from "./routes/auth.js";
import roomModel from "./models/room.js";
import { app, server } from './socket/socket.js'
dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  optionsSuccessStatus: 200
}));

const PORT = 3000;


app.use(express.json());

userModel();
roomModel();
// authentication routes
app.use('/auth', authRouter);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server runnning at specifed port")
  })
})
