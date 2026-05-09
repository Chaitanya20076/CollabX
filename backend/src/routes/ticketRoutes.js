import express from "express";

import {
  createSupportTicket,
  listUserTickets,
} from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", listUserTickets);
router.post("/", createSupportTicket);

export default router;
