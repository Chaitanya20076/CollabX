import {
  firestore,
} from "../config/firebaseAdmin.js";
import {
  trackActivity,
} from "./activityService.js";

const tickets = firestore.collection("tickets");

const createTrackingCode = (id = "") =>
  `CX-TKT-${id.slice(0, 8).toUpperCase()}`;

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

const SUPPORT_AGENTS = [
  { id: "agent-1", name: "Alice", specialty: "booking" },
  { id: "agent-2", name: "Bob", specialty: "refund" },
  { id: "agent-3", name: "Charlie", specialty: "technical" },
  { id: "agent-4", name: "Diana", specialty: "general_support" }
];

const sanitizeTicketText = (value = "") =>
  String(value || "")
    .replace(/\[ACTION:[^\]]+\]/gi, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[`*_#>]+/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const normalizeTicketCategory = (category = "") => {
  const normalized = String(category || "").toLowerCase().trim();

  if ([
    "booking",
    "refund",
    "technical",
    "general_support",
    "product_support",
    "payment",
    "account",
    "complaint",
  ].includes(normalized)) {
    return normalized;
  }

  if (["support_ticket"].includes(normalized)) {
    return "technical";
  }

  return "general_support";
};

const assignTicketToAgent = async (ticketCategory) => {
  const preferredAgents = SUPPORT_AGENTS.filter(a => a.specialty === ticketCategory);
  const agentsPool = preferredAgents.length > 0 ? preferredAgents : SUPPORT_AGENTS;
  
  const agentLoads = await Promise.all(
    agentsPool.map(async (agent) => {
      const snapshot = await tickets.where("assignedTo.id", "==", agent.id)
                                    .where("status", "==", "open")
                                    .count().get();
      return { agent, count: snapshot.data().count };
    })
  );

  agentLoads.sort((a, b) => a.count - b.count);
  return agentLoads[0].agent;
};

export const createTicket = async (payload = {}) => {
  const now = new Date();
  const docRef = tickets.doc();
  const category = normalizeTicketCategory(payload.category);
  const trackingCode = createTrackingCode(docRef.id);
  
  const assignedAgent = await assignTicketToAgent(category);

  const ticket = {
    userId: payload.userId || "anonymous",
    userEmail: payload.userEmail || "",
    title: sanitizeTicketText(payload.title) || "Support request",
    category,
    summary: sanitizeTicketText(payload.summary),
    priority: payload.priority || "normal",
    status: "open",
    trackingCode,
    source: payload.source || "ai_chat",
    attachments: Array.isArray(payload.attachments)
      ? payload.attachments.slice(0, 5)
      : [],
    assignedTo: assignedAgent,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(ticket);

  const saved = await docRef.get();
  const serialized = serializeTicket(saved);

  await trackActivity({
    userId: ticket.userId,
    type: "ticket_created",
    title: "Ticket assigned",
    description: `Ticket assigned to agent ${assignedAgent.name}`,
    metadata: {
      ticketId: serialized.id,
      trackingCode: ticket.trackingCode,
      priority: ticket.priority,
      agentId: assignedAgent.id,
      agentName: assignedAgent.name,
    },
  });

  return serialized;
};

export const getTicketByTrackingCode = async (code = "") => {
  const raw = String(code || "").trim();
  const normalized = raw.toUpperCase();
  if (!normalized) return null;

  const trackingSnapshot = await tickets
    .where("trackingCode", "==", normalized)
    .limit(1)
    .get();

  if (!trackingSnapshot.empty) {
    return serializeTicket(trackingSnapshot.docs[0]);
  }

  const doc = await tickets.doc(raw).get();
  if (doc.exists) return serializeTicket(doc);

  return null;
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
