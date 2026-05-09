import {
  createPaymentOrder,
  getUserTransactions,
  markPaymentFailure,
  requestPaymentRefund,
  verifyPayment,
} from "../services/paymentService.js";

export const createOrder =
  async (req, res) => {
    try {
      const payment =
        await createPaymentOrder(req.body);

      res.status(201).json({
        success: true,
        ...payment,
      });
    } catch (error) {
      console.log(error);

      res.status(error.statusCode || 500).json({
        success: false,
        message:
          error.message || "Payment order failed",
      });
    }
  };

export const verifyOrderPayment =
  async (req, res) => {
    try {
      const result = await verifyPayment(req.body);

      res.status(result.verified ? 200 : 400).json({
        success: result.verified,
        ...result,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  };

export const failPayment =
  async (req, res) => {
    try {
      const transaction =
        await markPaymentFailure(req.body);

      res.status(200).json({
        success: true,
        transaction,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Payment failure logging failed",
      });
    }
  };

export const listTransactions =
  async (req, res) => {
    try {
      const transactions =
        await getUserTransactions(req.query.userId);

      res.status(200).json({
        success: true,
        transactions,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Transaction loading failed",
      });
    }
  };

export const requestRefund =
  async (req, res) => {
    try {
      const transaction =
        await requestPaymentRefund({
          transactionId: req.params.id,
          reason: req.body.reason,
        });

      res.status(200).json({
        success: true,
        transaction,
      });
    } catch (error) {
      console.log(error);

      res.status(error.statusCode || 500).json({
        success: false,
        message:
          error.message || "Refund request failed",
      });
    }
  };
