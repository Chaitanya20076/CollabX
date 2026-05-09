import express from "express";

import {
  chatWithAI,
  getChat,
  listChats,
  saveChat,
} from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/", chatWithAI);
router.get("/sessions", listChats);
router.get("/sessions/:id", getChat);
router.post("/sessions", saveChat);

export default router;
