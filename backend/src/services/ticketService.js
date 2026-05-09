import {
  firestore,
} from "../config/firebaseAdmin.js";
import {
  trackActivity,
} from "./activityService.js";

const tickets = firestore.collection("tickets");

const serializeTicket = (doc) => {
  const data = doc.data();

  return {
    id: doc.id,
    ...data,
    createdAt:
      data.createdAt?.toDate?.().toISOString?.() ||
      data.createdAt ||
      null,
    updatedAt:
      data.updatedAt?.toDate?.().toISOString?.() ||
      data.updatedAt ||
      null,
  };
};

export const createTicket = async (payload = {}) => {
  const now = new Date();
  const docRef = tickets.doc();

  const ticket = {
    userId: payload.userId || "anonymous",
    userEmail: payload.userEmail || "",
    title: payload.title || "Support request",
    category: payload.category || "general_support",
    summary: payload.summary || "",
    priority: payload.priority || "normal",
    status: "open",
    source: payload.source || "ai_chat",
    attachments: Array.isArray(payload.attachments)
      ? payload.attachments.slice(0, 5)
      : [],
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(ticket);

  const saved = await docRef.get();
  const serialized = serializeTicket(saved);

  await trackActivity({
    userId: ticket.userId,
    type: "ticket_created",
    title: "Ticket created",
    description: ticket.title,
    metadata: {
      ticketId: serialized.id,
      priority: ticket.priority,
    },
  });

  return serialized;
};

export const getUserTickets = async (userId) => {
  const snapshot = await tickets
    .where("userId", "==", userId || "anonymous")
    .limit(50)
    .get();

  return snapshot.docs
    .map(serializeTicket)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );
};
