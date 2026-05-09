import express from "express";

import {
  calendarIntegration,
  emailNotification,
  expansionCapabilities,
  itineraryPlanner,
  multilingualAI,
  ocrTicketScan,
  recommendationEngine,
  supportAgentRequest,
  voiceAssistant,
  whatsappWebhook,
} from "../controllers/expansionController.js";

const router = express.Router();

router.get("/capabilities", expansionCapabilities);
router.post("/whatsapp/webhook", whatsappWebhook);
router.post("/voice-assistant", voiceAssistant);
router.post("/ocr-ticket-scan", ocrTicketScan);
router.post("/itinerary-plan", itineraryPlanner);
router.post("/multi-language-ai", multilingualAI);
router.post("/support-agent", supportAgentRequest);
router.post("/calendar-event", calendarIntegration);
router.get("/recommendations", recommendationEngine);
router.post("/email-notification", emailNotification);

export default router;
