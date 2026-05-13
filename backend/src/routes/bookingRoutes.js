import express from "express";

import {
  cancelUserBooking,
  confirmCancellationRequest,
  createUserBooking,
  getCancellationRequest,
  getUserBooking,
  listBookingRecommendations,
  listUserBookings,
  requestCancellationEmail,
  requestBookingRefund,
  trackBookingByCode,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/", listUserBookings);
router.post("/", createUserBooking);
router.get("/recommendations", listBookingRecommendations);
router.get("/track/:code", trackBookingByCode);
router.get("/cancellation/:token", getCancellationRequest);
router.post("/cancellation/:token/confirm", confirmCancellationRequest);
router.get("/:id", getUserBooking);
router.post("/:id/cancel-request", requestCancellationEmail);
router.patch("/:id/cancel", cancelUserBooking);
router.patch("/:id/refund", requestBookingRefund);

export default router;
