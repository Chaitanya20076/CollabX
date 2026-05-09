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
    travelDate:
      data.travelDate?.toDate?.().toISOString?.() ||
      data.travelDate ||
      null,
  };
};

export const createBooking = async (payload = {}) => {
  const type = normalizeType(payload.type);
  const quantity = Math.max(Number(payload.quantity || 1), 1);
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
    status: "confirmed",
    confirmationCode,
    availability,
    pricing: calculatePricing(type, quantity),
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
      type: booking.type,
    },
  });

  if (booking.userEmail) {
    await sendEmailNotification({
      to: booking.userEmail,
      subject: "CollabX booking confirmed",
      text: `Your booking is confirmed. Confirmation code: ${booking.confirmationCode}`,
    });
  }

  return serialized;
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
