import express from "express";

import {
  cancelUserBooking,
  createUserBooking,
  listBookingRecommendations,
  listUserBookings,
  requestBookingRefund,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/", listUserBookings);
router.post("/", createUserBooking);
router.get("/recommendations", listBookingRecommendations);
router.patch("/:id/cancel", cancelUserBooking);
router.patch("/:id/refund", requestBookingRefund);

export default router;
