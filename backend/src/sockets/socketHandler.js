import {
  realtimeBus,
} from "../realtime/eventBus.js";

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    const userId =
      socket.handshake.auth?.userId ||
      socket.handshake.query?.userId;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.emit("connected", {
      message: "CollabX realtime connected",
    });
  });

  realtimeBus.on("user:event", (payload) => {
    if (payload?.userId) {
      io.to(`user:${payload.userId}`).emit(
        "user:event",
        payload
      );
    }

    io.emit("activity:event", payload);
  });
};
