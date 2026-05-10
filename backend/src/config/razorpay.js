import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config({
  path: new URL("../../.env", import.meta.url),
  quiet: true,
});

export const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID?.trim();

export const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET?.trim();

export const razorpay =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;
