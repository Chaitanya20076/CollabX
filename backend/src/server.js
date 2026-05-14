import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { corsOptions } from "./config/corsOptions.js";
import {
  initializeSocket,
} from "./sockets/socketHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

initializeSocket(io);

server.listen(PORT, () => {
  console.log(
    `CollabX Backend Running On Port ${PORT}`
  );
});
