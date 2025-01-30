import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const origin = process.env.ORIGIN2;

let io;
console.log(origin);

export const initializeSocket = (server) =>{
  io = new SocketIOServer(server, {
    cors: {
      origin: origin, // Change this if you have specific frontend domains
      methods: ["GET", "POST"]
    }
  });

  console.log("✅ WebSocket server initialized");

  io.on("connection", (socket) => {
    //console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
      //console.log("A user disconnected:", socket.id);
    });
  });
}

export const emitEvent = (event, data) =>{
  if (io) {
    io.emit(event, data);
  }
}