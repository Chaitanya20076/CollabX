import express from "express";

import {
  createSupportTicket,
  listUserTickets,
  trackTicketByCode,
} from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", listUserTickets);
router.get("/track/:code", trackTicketByCode);
router.post("/", createSupportTicket);

export default router;
