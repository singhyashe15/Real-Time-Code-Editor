import express from "express";
import { Server } from "socket.io";
import http from "http";
import roomModel from "../models/room.js";
import dotenv from "dotenv";
import { connect } from "http2";

dotenv.config();

const app = express();
const server = http.createServer(app);

// allow only limited url
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Allow all origins (use specific domain in production)
    methods: ["GET", "POST"],
  },
});

const roomChats = {};
const adminSocketId = new Map();

io.on("connection", (socket) => {
  socket.on("code-room", async ({ roomId, userId }) => {
    socket.join(roomId);
    const room = await roomModel.findById({ _id: roomId });
    
    if (room.adminId.toString() === "686256c0c774740ef46e70d5") {
      adminSocketId.set(roomId, socket.id)
    }
  })

  socket.on('real-time-code-sent', async ({ code, roomId }) => {
    const syncCode = await roomModel.updateOne({ _id: roomId }, { savedCode: code });

    if (syncCode) {
      const code = await roomModel.findById({ _id: roomId });
      io.to(roomId).emit("real-time-code-sync", code.savedCode);
    }
  })

  socket.on('chat', ({ roomId, name, id, text }) => {
    if (!roomChats[roomId]) roomChats[roomId] = [];

    roomChats[roomId].push({ id, name, text });
    io.to(roomId).emit('received-chat', roomChats[roomId]);
  });

  socket.on('request-join-room', ({ roomId, name, id }) => {
    
    const adminId = adminSocketId.get(roomId);
    const requestId = socket.id;
    io.to(adminId).emit('join-request', { name, id, requestId });
  })

  socket.on("respond-join-request", ({ requestId, isApproved }) => {
    if (isApproved === true) {
      io.to(requestId).emit("join-approved");
    } else {
      io.to(requestId).emit("join-denied", { reason: "Rejected by admin" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
})

export { app, server };
