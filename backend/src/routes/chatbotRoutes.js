import express from "express";

import {
  chatWithAI,
  deleteChat,
  getChat,
  listChats,
  saveChat,
  streamChatWithAI,
} from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/", chatWithAI);
router.post("/stream", streamChatWithAI);
router.get("/sessions", listChats);
router.get("/sessions/:id", getChat);
router.post("/sessions", saveChat);
router.delete("/sessions/:id", deleteChat);

export default router;
