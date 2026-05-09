import crypto from "crypto";

import {
  firestore,
} from "../config/firebaseAdmin.js";

import {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  razorpay,
} from "../config/razorpay.js";
import {
  trackActivity,
} from "./activityService.js";
import {
  sendEmailNotification,
} from "./emailService.js";

const transactions =
  firestore.collection("transactions");
const bookings = firestore.collection("bookings");

const serializeTransaction = (doc) => {
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

export const createPaymentOrder = async ({
  bookingId,
  userId,
  userEmail,
} = {}) => {
  if (!razorpay) {
    const error = new Error(
      "Razorpay keys are not configured"
    );
    error.statusCode = 503;
    throw error;
  }

  const bookingDoc =
    await bookings.doc(bookingId).get();

  if (!bookingDoc.exists) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  const booking = bookingDoc.data();
  const amount = Number(booking.pricing?.total || 0);

  if (!amount) {
    const error = new Error("Invalid booking amount");
    error.statusCode = 400;
    throw error;
  }

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: booking.pricing?.currency || "INR",
    receipt: `booking_${bookingId.slice(0, 20)}`,
    notes: {
      bookingId,
      userId: userId || booking.userId || "anonymous",
      serviceType: booking.type,
    },
  });

  const now = new Date();

  await transactions.doc(order.id).set({
    bookingId,
    userId: userId || booking.userId || "anonymous",
    userEmail: userEmail || booking.userEmail || "",
    razorpayOrderId: order.id,
    amount,
    currency: order.currency,
    serviceType: booking.type,
    platformFee: booking.pricing?.platformFee || 0,
    status: "created",
    createdAt: now,
    updatedAt: now,
  });

  await trackActivity({
    userId: userId || booking.userId || "anonymous",
    type: "payment_order_created",
    title: "Payment checkout created",
    description: `${booking.type} payment order created`,
    metadata: {
      bookingId,
      orderId: order.id,
      amount,
    },
  });

  if (transaction?.userEmail) {
    await sendEmailNotification({
      to: transaction.userEmail,
      subject: verified
        ? "CollabX payment confirmed"
        : "CollabX payment failed",
      text: verified
        ? `Payment confirmed for order ${razorpay_order_id}.`
        : `Payment failed for order ${razorpay_order_id}.`,
    });
  }

  return {
    order,
    keyId: RAZORPAY_KEY_ID,
    amount,
    currency: order.currency,
  };
};

export const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
} = {}) => {
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");

  const verified =
    expectedSignature === razorpay_signature;

  const docRef =
    transactions.doc(razorpay_order_id);
  const transactionDoc = await docRef.get();
  const transaction = transactionDoc.data();

  await docRef.set(
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: verified ? "paid" : "failed",
      updatedAt: new Date(),
    },
    {
      merge: true,
    }
  );

  if (transaction?.bookingId) {
    await bookings.doc(transaction.bookingId).set(
      {
        paymentStatus: verified ? "paid" : "failed",
        updatedAt: new Date(),
      },
      {
        merge: true,
      }
    );
  }

  await trackActivity({
    userId: transaction?.userId || "anonymous",
    type: verified ? "payment_success" : "payment_failed",
    title: verified
      ? "Payment confirmed"
      : "Payment failed",
    description: `Order ${razorpay_order_id}`,
    metadata: {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    },
  });

  return {
    verified,
    transaction:
      serializeTransaction(await docRef.get()),
  };
};

export const markPaymentFailure = async ({
  orderId,
  reason,
} = {}) => {
  const docRef = transactions.doc(orderId);

  await docRef.set(
    {
      status: "failed",
      failureReason: reason || "Payment failed",
      updatedAt: new Date(),
    },
    {
      merge: true,
    }
  );

  const transaction =
    serializeTransaction(await docRef.get());

  await trackActivity({
    userId: transaction.userId,
    type: "payment_failed",
    title: "Payment failed",
    description: reason || "Payment failed",
    metadata: {
      orderId,
    },
  });

  return transaction;
};

export const getUserTransactions = async (userId) => {
  const snapshot = await transactions
    .where("userId", "==", userId || "anonymous")
    .limit(80)
    .get();

  return snapshot.docs
    .map(serializeTransaction)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );
};

export const requestPaymentRefund = async ({
  transactionId,
  reason,
} = {}) => {
  const docRef = transactions.doc(transactionId);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  await docRef.set(
    {
      refundStatus: "requested",
      refundReason: reason || "",
      updatedAt: new Date(),
    },
    {
      merge: true,
    }
  );

  const transaction =
    serializeTransaction(await docRef.get());

  await trackActivity({
    userId: transaction.userId,
    type: "payment_refund_requested",
    title: "Payment refund requested",
    description: reason || "Refund requested",
    metadata: {
      transactionId,
    },
  });

  return transaction;
};
