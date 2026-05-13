import crypto from "crypto";

import {
  firestore,
} from "../config/firebaseAdmin.js";
import {
  trackActivity,
} from "./activityService.js";
import {
  sendEmailNotification,
} from "./emailService.js";

const bookings = firestore.collection("bookings");

const REFUND_WINDOW_MS = 24 * 60 * 60 * 1000;

const createRefundToken = () =>
  crypto.randomBytes(24).toString("hex");

const createTrackingCode = (prefix, id = "") =>
  `${prefix}-${id.slice(0, 8).toUpperCase()}`;

const bookingCatalog = {
  movie: {
    label: "Movie",
    basePrice: 260,
    feeRate: 0.02,
    options: [
      "Evening show",
      "Premium screen",
      "Family combo",
    ],
  },
  flight: {
    label: "Flight",
    basePrice: 6200,
    feeRate: 0.05,
    options: [
      "Morning departure",
      "Lowest fare",
      "Flexible cancellation",
    ],
  },
  hotel: {
    label: "Hotel",
    basePrice: 3400,
    feeRate: 0.06,
    options: [
      "Breakfast included",
      "Near city center",
      "Free cancellation",
    ],
  },
  event: {
    label: "Event",
    basePrice: 1200,
    feeRate: 0.07,
    options: [
      "Best value seats",
      "Weekend slot",
      "Group booking",
    ],
  },
  concert: {
    label: "Concert",
    basePrice: 1800,
    feeRate: 0.07,
    options: [
      "Early entry",
      "Front section",
      "Standard pass",
    ],
  },
};

const normalizeType = (type = "event") =>
  bookingCatalog[type] ? type : "event";

const calculateAvailability = (type, quantity = 1) => {
  const seed =
    type
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) +
    Number(quantity || 1);

  const seatsAvailable = 12 + (seed % 38);

  return {
    seatsAvailable,
    requestedQuantity: Number(quantity || 1),
    available:
      seatsAvailable >= Number(quantity || 1),
  };
};

export const calculatePricing = (
  type,
  quantity = 1
) => {
  const safeType = normalizeType(type);
  const catalog = bookingCatalog[safeType];
  const qty = Math.max(Number(quantity || 1), 1);
  const demandMultiplier =
    qty >= 4 ? 1.12 : qty >= 2 ? 1.06 : 1;
  const subtotal = Math.round(
    catalog.basePrice * qty * demandMultiplier
  );
  const platformFee = Math.round(
    subtotal * catalog.feeRate
  );

  return {
    currency: "INR",
    basePrice: catalog.basePrice,
    quantity: qty,
    subtotal,
    platformFee,
    total: subtotal + platformFee,
    feeRate: catalog.feeRate,
    demandMultiplier,
  };
};

export const getBookingRecommendations = ({
  type = "event",
  quantity = 1,
} = {}) => {
  const safeType = normalizeType(type);
  const catalog = bookingCatalog[safeType];
  const pricing = calculatePricing(safeType, quantity);
  const availability = calculateAvailability(
    safeType,
    quantity
  );

  return catalog.options.map((option, index) => ({
    id: `${safeType}-option-${index + 1}`,
    type: safeType,
    title: `${catalog.label} ${option}`,
    description:
      index === 0
        ? "Recommended by CollabX for price and availability balance."
        : "Available booking workflow option.",
    availability,
    pricing: {
      ...pricing,
      total: pricing.total + index * 180,
    },
  }));
};

const serializeBooking = (doc) => {
  const data = doc.data();
  const refundInitiatedAt =
    data.refundInitiatedAt?.toDate?.() ||
    (data.refundInitiatedAt
      ? new Date(data.refundInitiatedAt)
      : null);
  const refundReady =
    refundInitiatedAt &&
    Date.now() - refundInitiatedAt.getTime() >= REFUND_WINDOW_MS;
  const refundStatus =
    data.refundStatus === "initiated" && refundReady
      ? "successful"
      : data.refundStatus;

  return {
    id: doc.id,
    ...data,
    refundStatus,
    createdAt:
      data.createdAt?.toDate?.().toISOString?.() ||
      data.createdAt ||
      null,
    updatedAt:
      data.updatedAt?.toDate?.().toISOString?.() ||
      data.updatedAt ||
      null,
    travelDate:
      data.travelDate?.toDate?.().toISOString?.() ||
      data.travelDate ||
      null,
    cancellationRequestedAt:
      data.cancellationRequestedAt?.toDate?.().toISOString?.() ||
      data.cancellationRequestedAt ||
      null,
    refundInitiatedAt:
      data.refundInitiatedAt?.toDate?.().toISOString?.() ||
      data.refundInitiatedAt ||
      null,
    refundCompletedAt:
      refundStatus === "successful" && refundInitiatedAt
        ? new Date(
            refundInitiatedAt.getTime() + REFUND_WINDOW_MS
          ).toISOString()
        : data.refundCompletedAt?.toDate?.().toISOString?.() ||
          data.refundCompletedAt ||
          null,
  };
};

export const createBooking = async (payload = {}) => {
  const type = normalizeType(payload.type);
  const quantity = Math.max(Number(payload.quantity || 1), 1);
  const selectedSeats = Array.isArray(payload.selectedSeats)
    ? payload.selectedSeats
        .map((seat) => String(seat).trim())
        .filter(Boolean)
        .slice(0, 12)
    : [];
  const customTotal = Number(payload.totalAmount || 0);
  const calculatedPricing = calculatePricing(type, quantity);
  const pricing =
    customTotal > 0
      ? {
          ...calculatedPricing,
          quantity,
          subtotal: customTotal,
          platformFee: 0,
          total: customTotal,
        }
      : calculatedPricing;
  const availability = calculateAvailability(type, quantity);

  if (!availability.available) {
    const error = new Error("Requested seats are not available");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date();
  const docRef = bookings.doc();
  const confirmationCode = `CXB-${docRef.id
    .slice(0, 6)
    .toUpperCase()}`;
  const trackingCode = createTrackingCode("CX-BOOK", docRef.id);

  const booking = {
    userId: payload.userId || "anonymous",
    userEmail: payload.userEmail || "",
    type,
    title:
      payload.title ||
      `${bookingCatalog[type].label} booking`,
    destination: payload.destination || "",
    source: payload.source || "",
    travelDate: payload.travelDate || "",
    quantity,
    selectedSeats,
    status: "confirmed",
    confirmationCode,
    trackingCode,
    availability,
    pricing,
    recommendation:
      payload.recommendation ||
      getBookingRecommendations({
        type,
        quantity,
      })[0],
    refundStatus: "none",
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(booking);

  const saved = await docRef.get();
  const serialized = serializeBooking(saved);

  await trackActivity({
    userId: booking.userId,
    type: "booking_confirmed",
    title: "Booking confirmed",
    description: `${booking.title} confirmed with ${booking.confirmationCode}`,
    metadata: {
      bookingId: serialized.id,
      confirmationCode: booking.confirmationCode,
      trackingCode: booking.trackingCode,
      type: booking.type,
    },
  });

  if (booking.userEmail) {
    await sendEmailNotification({
      to: booking.userEmail,
      subject: "CollabX booking confirmed",
      text: `Your booking is confirmed. Tracking code: ${booking.trackingCode}`,
    });
  }

  return serialized;
};

export const getBookingByTrackingCode = async (code = "") => {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return null;

  const trackingSnapshot = await bookings
    .where("trackingCode", "==", normalized)
    .limit(1)
    .get();

  if (!trackingSnapshot.empty) {
    return serializeBooking(trackingSnapshot.docs[0]);
  }

  const confirmationSnapshot = await bookings
    .where("confirmationCode", "==", normalized)
    .limit(1)
    .get();

  if (!confirmationSnapshot.empty) {
    return serializeBooking(confirmationSnapshot.docs[0]);
  }

  return null;
};

export const getUserBookings = async (userId) => {
  const snapshot = await bookings
    .where("userId", "==", userId || "anonymous")
    .limit(80)
    .get();

  return snapshot.docs
    .map(serializeBooking)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );
};

export const getBookingById = async (id) => {
  const doc = await bookings.doc(id).get();

  if (!doc.exists) return null;

  const booking = serializeBooking(doc);

  if (
    booking.refundStatus === "successful" &&
    doc.data().refundStatus !== "successful"
  ) {
    await bookings.doc(id).set(
      {
        refundStatus: "successful",
        refundCompletedAt:
          booking.refundCompletedAt || new Date(),
        updatedAt: new Date(),
      },
      {
        merge: true,
      }
    );
  }

  return booking;
};

export const cancelBooking = async (id, reason = "") => {
  const docRef = bookings.doc(id);
  const existing = await docRef.get();

  if (!existing.exists) return null;

  await docRef.set(
    {
      status: "cancelled",
      cancellationReason: reason,
      refundStatus: "requested",
      updatedAt: new Date(),
    },
    {
      merge: true,
    }
  );

  const booking = serializeBooking(await docRef.get());

  await trackActivity({
    userId: booking.userId,
    type: "booking_cancelled",
    title: "Booking cancelled",
    description: booking.title,
    metadata: {
      bookingId: booking.id,
    },
  });

  if (booking.userEmail) {
    await sendEmailNotification({
      to: booking.userEmail,
      subject: "CollabX booking cancelled",
      text: `Your booking ${booking.confirmationCode} has been cancelled.`,
    });
  }

  return booking;
};

export const requestCancellationVerification = async ({
  id,
  reason = "",
  frontendOrigin,
} = {}) => {
  const docRef = bookings.doc(id);
  const existing = await docRef.get();

  if (!existing.exists) return null;

  const booking = serializeBooking(existing);
  const token = createRefundToken();
  const total = Number(booking.pricing?.total || 0);
  const refundAmount = Math.round(total * 0.5);
  const origin =
    frontendOrigin ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";
  const confirmationUrl = `${origin.replace(
    /\/$/,
    ""
  )}/refund-confirm/${token}`;

  await docRef.set(
    {
      cancellationReason: reason,
      cancellationRequestedAt: new Date(),
      cancellationVerificationToken: token,
      cancellationVerificationUrl: confirmationUrl,
      refundStatus: "email_verification_pending",
      refundAmount,
      refundablePercent: 50,
      updatedAt: new Date(),
    },
    {
      merge: true,
    }
  );

  const saved = serializeBooking(await docRef.get());

  await trackActivity({
    userId: saved.userId,
    type: "refund_email_sent",
    title: "Refund email verification sent",
    description: `${saved.title} needs email confirmation before cancellation.`,
    metadata: {
      bookingId: saved.id,
      refundAmount,
    },
  });

  let email = {
    sent: false,
    reason: "No registered email on booking",
  };

  if (saved.userEmail) {
    email = await sendEmailNotification({
      to: saved.userEmail,
      subject: "Confirm your CollabX cancellation",
      text: `Confirm cancellation for ${saved.confirmationCode}: ${confirmationUrl}. Only 50% is refundable. Refund amount: INR ${refundAmount}.`,
      html: `<p>Confirm cancellation for <strong>${saved.confirmationCode}</strong>.</p><p>Only 50% is refundable. Refund amount: <strong>INR ${refundAmount}</strong>.</p><p><a href="${confirmationUrl}">Confirm cancellation</a></p>`,
    });
  }

  return {
    booking: saved,
    email,
    confirmationUrl: email.sent ? undefined : confirmationUrl,
  };
};

export const getCancellationByToken = async (token) => {
  const snapshot = await bookings
    .where("cancellationVerificationToken", "==", token)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return serializeBooking(snapshot.docs[0]);
};

export const confirmCancellationByToken = async (token) => {
  const snapshot = await bookings
    .where("cancellationVerificationToken", "==", token)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const booking = serializeBooking(doc);
  const total = Number(booking.pricing?.total || 0);
  const refundAmount =
    Number(booking.refundAmount || 0) ||
    Math.round(total * 0.5);
  const now = new Date();

  await doc.ref.set(
    {
      status: "cancelled",
      refundStatus: "initiated",
      refundAmount,
      refundablePercent: 50,
      refundInitiatedAt: now,
      cancellationVerifiedAt: now,
      updatedAt: now,
    },
    {
      merge: true,
    }
  );

  const saved = serializeBooking(await doc.ref.get());

  await trackActivity({
    userId: saved.userId,
    type: "refund_initiated",
    title: "Ticket cancelled and refund initiated",
    description: `${saved.confirmationCode} cancelled. INR ${refundAmount} refund will complete in 24 hrs.`,
    metadata: {
      bookingId: saved.id,
      refundAmount,
    },
  });

  if (saved.userEmail) {
    await sendEmailNotification({
      to: saved.userEmail,
      subject: "CollabX refund initiated",
      text: `Ticket successfully cancelled. Refund of INR ${refundAmount} has been initiated and will take 24 hrs.`,
    });
  }

  return saved;
};

export const requestRefund = async (id, reason = "") => {
  const docRef = bookings.doc(id);
  const existing = await docRef.get();

  if (!existing.exists) return null;

  await docRef.set(
    {
      refundStatus: "requested",
      refundReason: reason,
      updatedAt: new Date(),
    },
    {
      merge: true,
    }
  );

  const booking = serializeBooking(await docRef.get());

  await trackActivity({
    userId: booking.userId,
    type: "refund_requested",
    title: "Refund requested",
    description: booking.title,
    metadata: {
      bookingId: booking.id,
    },
  });

  if (booking.userEmail) {
    await sendEmailNotification({
      to: booking.userEmail,
      subject: "CollabX refund requested",
      text: `Your refund request for ${booking.confirmationCode} has been received.`,
    });
  }

  return booking;
};
