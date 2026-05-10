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

const createMockOrder = (bookingId, booking, amount) => ({
  id: `order_mock_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`,
  amount: amount * 100,
  currency: booking.pricing?.currency || "INR",
  receipt: `booking_${bookingId.slice(0, 20)}`,
  status: "created",
  notes: {
    bookingId,
    userId: booking.userId || "anonymous",
    serviceType: booking.type,
  },
});

const createPaymentToken = () =>
  crypto.randomBytes(18).toString("hex");

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

  let isMock = !razorpay;
  let fallbackReason = "";
  let order = null;

  if (!isMock) {
    try {
      order = await razorpay.orders.create({
        amount: amount * 100,
        currency: booking.pricing?.currency || "INR",
        receipt: `booking_${bookingId.slice(0, 20)}`,
        notes: {
          bookingId,
          userId: userId || booking.userId || "anonymous",
          serviceType: booking.type,
        },
      });
    } catch (error) {
      const statusCode = error?.statusCode || error?.status;
      const description =
        error?.error?.description ||
        error?.message ||
        "Razorpay order creation failed";

      if (statusCode !== 401) {
        throw error;
      }

      isMock = true;
      fallbackReason = description;
      order = createMockOrder(bookingId, booking, amount);
    }
  }

  if (!order) {
    order = createMockOrder(bookingId, booking, amount);
  }

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
    provider: isMock ? "mock" : "razorpay",
    fallbackReason,
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

  return {
    order,
    keyId: RAZORPAY_KEY_ID,
    amount,
    currency: order.currency,
    mock: isMock,
    fallbackReason,
  };
};

export const createCollabXPaymentSession = async ({
  bookingId,
  userId,
  userEmail,
  amount,
  currency = "INR",
  frontendOrigin,
} = {}) => {
  const bookingDoc =
    await bookings.doc(bookingId).get();

  if (!bookingDoc.exists) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  const booking = bookingDoc.data();
  const total = Number(amount || booking.pricing?.total || 0);

  if (!total) {
    const error = new Error("Invalid payment amount");
    error.statusCode = 400;
    throw error;
  }

  const token = createPaymentToken();
  const orderId = `order_collabx_${Date.now()}_${token.slice(0, 8)}`;
  const origin =
    frontendOrigin ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";
  const confirmationUrl =
    `${origin.replace(/\/$/, "")}/payment-confirm/${token}`;
  const now = new Date();

  await transactions.doc(orderId).set({
    bookingId,
    userId: userId || booking.userId || "anonymous",
    userEmail: userEmail || booking.userEmail || "",
    razorpayOrderId: orderId,
    amount: total,
    currency,
    serviceType: booking.type,
    platformFee: booking.pricing?.platformFee || 0,
    provider: "collabx_demo",
    status: "pending",
    paymentToken: token,
    confirmationUrl,
    createdAt: now,
    updatedAt: now,
  });

  await trackActivity({
    userId: userId || booking.userId || "anonymous",
    type: "collabx_payment_created",
    title: "CollabX payment checkout created",
    description: `${booking.type} demo payment session created`,
    metadata: {
      bookingId,
      orderId,
      amount: total,
    },
  });

  return {
    id: orderId,
    orderId,
    bookingId,
    amount: total,
    currency,
    status: "pending",
    token,
    confirmationUrl,
    provider: "collabx_demo",
  };
};

export const getCollabXPaymentSession = async (token) => {
  const snapshot = await transactions
    .where("paymentToken", "==", token)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  return serializeTransaction(snapshot.docs[0]);
};

export const confirmCollabXPaymentSession = async ({
  token,
  method = "upi",
} = {}) => {
  const session = await getCollabXPaymentSession(token);

  if (!session) return null;

  const paymentId =
    session.razorpayPaymentId ||
    `pay_collabx_${Date.now()}_${token.slice(0, 6)}`;
  const now = new Date();

  await transactions.doc(session.id).set(
    {
      status: "paid",
      paymentMethod: method,
      razorpayPaymentId: paymentId,
      paidAt: now,
      updatedAt: now,
    },
    {
      merge: true,
    }
  );

  if (session.bookingId) {
    await bookings.doc(session.bookingId).set(
      {
        paymentStatus: "paid",
        updatedAt: now,
      },
      {
        merge: true,
      }
    );
  }

  await trackActivity({
    userId: session.userId || "anonymous",
    type: "payment_success",
    title: "CollabX payment confirmed",
    description: `Order ${session.id}`,
    metadata: {
      orderId: session.id,
      paymentId,
      method,
    },
  });

  return serializeTransaction(
    await transactions.doc(session.id).get()
  );
};

export const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
} = {}) => {
  const docRef =
    transactions.doc(razorpay_order_id);
  const transactionDoc = await docRef.get();
  const transaction = transactionDoc.data();
  const isMock = transaction?.provider === "mock";

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");

  const verified =
    isMock ||
    expectedSignature === razorpay_signature;

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
