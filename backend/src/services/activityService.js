import {
  firestore,
} from "../config/firebaseAdmin.js";
import {
  publishRealtimeEvent,
} from "../realtime/eventBus.js";

const activities =
  firestore.collection("userActivities");

const serializeActivity = (doc) => {
  const data = doc.data();

  return {
    id: doc.id,
    ...data,
    createdAt:
      data.createdAt?.toDate?.().toISOString?.() ||
      data.createdAt ||
      null,
  };
};

export const trackActivity = async ({
  userId = "anonymous",
  type = "activity",
  title = "Activity",
  description = "",
  metadata = {},
} = {}) => {
  const payload = {
    userId,
    type,
    title,
    description,
    metadata,
    createdAt: new Date(),
  };

  const docRef = await activities.add(payload);
  const saved = serializeActivity(await docRef.get());

  publishRealtimeEvent("user:event", saved);

  return saved;
};

export const getUserActivities = async (userId) => {
  const snapshot = await activities
    .where("userId", "==", userId || "anonymous")
    .limit(80)
    .get();

  return snapshot.docs
    .map(serializeActivity)
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
};
