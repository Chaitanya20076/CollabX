import {
  firestore,
} from "../config/firebaseAdmin.js";

const countCollection = async (name) => {
  const snapshot = await firestore
    .collection(name)
    .limit(500)
    .get();

  return snapshot.size;
};

export const getAdminAnalytics = async () => {
  const [
    tickets,
    bookings,
    transactions,
    chatSessions,
    activities,
  ] = await Promise.all([
    countCollection("tickets"),
    countCollection("bookings"),
    countCollection("transactions"),
    countCollection("chatSessions"),
    countCollection("userActivities"),
  ]);

  return {
    tickets,
    bookings,
    transactions,
    chatSessions,
    activities,
    generatedAt: new Date().toISOString(),
  };
};
