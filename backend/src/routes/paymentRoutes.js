import express from "express";

import {
  createOrder,
  failPayment,
  listTransactions,
  requestRefund,
  verifyOrderPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/transactions", listTransactions);
router.post("/order", createOrder);
router.post("/verify", verifyOrderPayment);
router.post("/failure", failPayment);
router.patch("/transactions/:id/refund", requestRefund);

export default router;
