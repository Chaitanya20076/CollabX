import express from "express";

import cors from "cors";

import helmet from "helmet";

import morgan from "morgan";

import cookieParser from "cookie-parser";

import rateLimit from "express-rate-limit";

import chatbotRoutes from "./routes/chatbotRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import expansionRoutes from "./routes/expansionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "CollabX AI Backend Running",
  });
});

app.use("/api/chat", chatbotRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/expansion", expansionRoutes);
app.use("/api/admin", adminRoutes);

export default app;
