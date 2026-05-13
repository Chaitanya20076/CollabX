import {
  cancelBooking,
  confirmCancellationByToken,
  createBooking,
  getBookingById,
  getBookingByTrackingCode,
  getCancellationByToken,
  getBookingRecommendations,
  getUserBookings,
  requestCancellationVerification,
  requestRefund,
} from "../services/bookingService.js";

export const listBookingRecommendations =
  async (req, res) => {
    const recommendations =
      getBookingRecommendations(req.query);

    res.status(200).json({
      success: true,
      recommendations,
    });
  };

export const createUserBooking =
  async (req, res) => {
    try {
      const booking = await createBooking(req.body);

      res.status(201).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.log(error);

      res.status(error.statusCode || 500).json({
        success: false,
        message:
          error.message || "Booking creation failed",
      });
    }
  };

export const listUserBookings =
  async (req, res) => {
    try {
      const bookings = await getUserBookings(
        req.query.userId
      );

      res.status(200).json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Booking loading failed",
      });
    }
  };

export const getUserBooking =
  async (req, res) => {
    try {
      const booking = await getBookingById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Booking loading failed",
      });
    }
  };

export const trackBookingByCode =
  async (req, res) => {
    try {
      const booking = await getBookingByTrackingCode(req.params.code);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Tracking code not found",
        });
      }

      res.status(200).json({
        success: true,
        type: "booking",
        record: booking,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Tracking lookup failed",
      });
    }
  };

export const cancelUserBooking =
  async (req, res) => {
    try {
      const booking = await cancelBooking(
        req.params.id,
        req.body.reason
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Booking cancellation failed",
      });
    }
  };

export const requestBookingRefund =
  async (req, res) => {
    try {
      const booking = await requestRefund(
        req.params.id,
        req.body.reason
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Refund request failed",
      });
    }
  };

export const requestCancellationEmail =
  async (req, res) => {
    try {
      const result =
        await requestCancellationVerification({
          id: req.params.id,
          reason: req.body.reason,
          frontendOrigin: req.body.frontendOrigin,
        });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Cancellation email failed",
      });
    }
  };

export const getCancellationRequest =
  async (req, res) => {
    try {
      const booking = await getCancellationByToken(
        req.params.token
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Cancellation link is invalid or expired",
        });
      }

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Cancellation link loading failed",
      });
    }
  };

export const confirmCancellationRequest =
  async (req, res) => {
    try {
      const booking = await confirmCancellationByToken(
        req.params.token
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Cancellation link is invalid or expired",
        });
      }

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Cancellation confirmation failed",
      });
    }
  };
