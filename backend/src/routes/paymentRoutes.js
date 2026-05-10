import express from "express";

import {
  confirmCollabXSession,
  createOrder,
  createCollabXSession,
  failPayment,
  getCollabXSession,
  listTransactions,
  requestRefund,
  verifyOrderPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/transactions", listTransactions);
router.post("/collabx-session", createCollabXSession);
router.get("/collabx-session/:token", getCollabXSession);
router.post("/collabx-session/:token/confirm", confirmCollabXSession);
router.post("/order", createOrder);
router.post("/verify", verifyOrderPayment);
router.post("/failure", failPayment);
router.patch("/transactions/:id/refund", requestRefund);

export default router;
