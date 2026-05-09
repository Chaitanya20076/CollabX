import {
  firestore,
} from "../config/firebaseAdmin.js";
import {
  trackActivity,
} from "./activityService.js";

const collection =
  firestore.collection("chatSessions");

const sanitizeMessages = (messages = []) =>
  Array.isArray(messages)
    ? messages
        .filter(
          (item) =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.text === "string"
        )
        .slice(-80)
        .map((item) => ({
          id: item.id || null,
          role: item.role,
          text: item.text.slice(0, 4000),
          widget: item.widget || null,
          attachments: Array.isArray(item.attachments)
            ? item.attachments.slice(0, 5)
            : [],
        }))
    : [];

const serializeSession = (doc) => {
  const data = doc.data();

  return {
    id: doc.id,
    userId: data.userId || "anonymous",
    title: data.title || "New support chat",
    messages: data.messages || [],
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

export const saveChatSession = async (session = {}) => {
  const id =
    session.id ||
    `chat-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

  const docRef = collection.doc(id);
  const existing = await docRef.get();
  const now = new Date();

  const payload = {
    userId:
      session.userId ||
      existing.data()?.userId ||
      "anonymous",
    title:
      session.title ||
      existing.data()?.title ||
      "New support chat",
    messages: sanitizeMessages(session.messages),
    createdAt:
      existing.exists
        ? existing.data()?.createdAt || now
        : session.createdAt
          ? new Date(session.createdAt)
          : now,
    updatedAt: now,
  };

  await docRef.set(payload, {
    merge: true,
  });

  const saved = await docRef.get();
  const savedSession = serializeSession(saved);

  await trackActivity({
    userId: savedSession.userId,
    type: "chat_saved",
    title: "AI chat saved",
    description: savedSession.title,
    metadata: {
      chatId: savedSession.id,
      messages: savedSession.messages.length,
    },
  });

  return savedSession;
};

export const getChatSessions = async (userId) => {
  const query = userId
    ? collection.where("userId", "==", userId).limit(50)
    : collection.limit(50);

  const snapshot = await query.get();

  return snapshot.docs
    .map(serializeSession)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );
};

export const getChatSession = async (id) => {
  const doc = await collection.doc(id).get();

  return doc.exists ? serializeSession(doc) : null;
};
