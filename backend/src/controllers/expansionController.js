import {
  createCalendarEvent,
  createMultilingualReply,
  getAIRecommendations,
  planItinerary,
  requestSupportAgent,
  scanTicketText,
  storeIntegrationEvent,
} from "../services/expansionService.js";
import {
  sendEmailNotification,
} from "../services/emailService.js";

export const whatsappWebhook =
  async (req, res) => {
    const event = await storeIntegrationEvent(
      "whatsapp",
      req.body
    );

    res.status(200).json({
      success: true,
      event,
      message: "WhatsApp webhook received",
    });
  };

export const voiceAssistant =
  async (req, res) => {
    const event = await storeIntegrationEvent(
      "voice_assistant",
      req.body
    );

    res.status(200).json({
      success: true,
      event,
      transcript: req.body.transcript || "",
    });
  };

export const ocrTicketScan =
  async (req, res) => {
    const result = await scanTicketText(req.body);

    res.status(200).json({
      success: true,
      ...result,
    });
  };

export const itineraryPlanner =
  async (req, res) => {
    const result = await planItinerary(req.body);

    res.status(200).json({
      success: true,
      ...result,
    });
  };

export const multilingualAI =
  async (req, res) => {
    const result =
      await createMultilingualReply(req.body);

    res.status(200).json({
      success: true,
      ...result,
    });
  };

export const supportAgentRequest =
  async (req, res) => {
    const request = await requestSupportAgent(req.body);

    res.status(201).json({
      success: true,
      request,
    });
  };

export const calendarIntegration =
  async (req, res) => {
    const event = await createCalendarEvent(req.body);

    res.status(201).json({
      success: true,
      event,
    });
  };

export const recommendationEngine =
  async (req, res) => {
    res.status(200).json({
      success: true,
      ...getAIRecommendations(req.query),
    });
  };

export const emailNotification =
  async (req, res) => {
    const result = await sendEmailNotification(req.body);

    res.status(result.sent ? 200 : 202).json({
      success: true,
      ...result,
    });
  };

export const expansionCapabilities =
  async (req, res) => {
    res.status(200).json({
      success: true,
      capabilities: {
        whatsappChatbot: "webhook_ready",
        voiceAssistant: "transcript_endpoint_ready",
        ocrTicketScanning: "text_extraction_intake_ready",
        aiItineraryPlanning: "sarvam_powered",
        multiLanguageAI: "sarvam_powered",
        adminDashboard: "analytics_api_ready",
        analyticsPanel: "firestore_counts_ready",
        liveSupportAgents: "queue_api_ready",
        mobileAppVersion: "rest_api_and_realtime_ready",
        aiRecommendationEngine: "booking_recommendations_ready",
        calendarIntegration: "internal_event_api_ready",
        emailNotifications: "smtp_ready_when_configured",
      },
    });
  };
