import {
  firestore,
} from "../config/firebaseAdmin.js";
import {
  generateAIResponse,
} from "../ai/sarvamClient.js";
import {
  getBookingRecommendations,
} from "./bookingService.js";

const integrations =
  firestore.collection("futureIntegrations");
const supportRequests =
  firestore.collection("supportAgentRequests");
const calendarEvents =
  firestore.collection("calendarEvents");

export const storeIntegrationEvent = async (
  type,
  payload = {}
) => {
  const doc = await integrations.add({
    type,
    payload,
    status: "received",
    createdAt: new Date(),
  });

  return {
    id: doc.id,
    type,
    status: "received",
  };
};

export const planItinerary = async ({
  destination,
  days,
  preferences,
} = {}) => {
  const prompt = `
Create a concise travel itinerary for CollabX.
Destination: ${destination || "not specified"}
Days: ${days || "not specified"}
Preferences: ${preferences || "general"}
Keep it practical and booking-friendly.
`;

  const reply = await generateAIResponse(prompt);

  return {
    itinerary: reply,
  };
};

export const createMultilingualReply = async ({
  message,
  language = "Hindi",
} = {}) => {
  const reply = await generateAIResponse(`
Reply to this CollabX support message in ${language}.
Keep meaning accurate and concise.
Message: ${message}
`);

  return {
    language,
    reply,
  };
};

export const scanTicketText = async ({
  extractedText,
} = {}) => ({
  status: "processed",
  extractedText: extractedText || "",
  fields: {
    possibleTicketId:
      extractedText?.match(/[A-Z]{2,}-?\d{3,}/)?.[0] ||
      null,
    containsAmount: /₹|rs\.?|inr|\d+\.\d{2}/i.test(
      extractedText || ""
    ),
  },
});

export const requestSupportAgent = async ({
  userId,
  topic,
  priority = "normal",
} = {}) => {
  const doc = await supportRequests.add({
    userId: userId || "anonymous",
    topic: topic || "Support request",
    priority,
    status: "waiting",
    createdAt: new Date(),
  });

  return {
    id: doc.id,
    status: "waiting",
  };
};

export const createCalendarEvent = async ({
  userId,
  title,
  start,
  end,
  metadata = {},
} = {}) => {
  const doc = await calendarEvents.add({
    userId: userId || "anonymous",
    title: title || "CollabX booking reminder",
    start,
    end,
    metadata,
    provider: "internal_calendar",
    createdAt: new Date(),
  });

  return {
    id: doc.id,
    title,
    start,
    end,
  };
};

export const getAIRecommendations = (query = {}) => ({
  recommendations: getBookingRecommendations(query),
});
