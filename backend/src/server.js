import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import {
  initializeSocket,
} from "./sockets/socketHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ].filter(Boolean),
    credentials: true,
  },
});

initializeSocket(io);

server.listen(PORT, () => {
  console.log(
    `CollabX Backend Running On Port ${PORT}`
  );
});
