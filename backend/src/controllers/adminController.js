import {
  getAdminAnalytics,
} from "../services/analyticsService.js";

export const analyticsPanel =
  async (req, res) => {
    try {
      const analytics = await getAdminAnalytics();

      res.status(200).json({
        success: true,
        analytics,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Analytics loading failed",
      });
    }
  };

export const adminDashboard =
  async (req, res) => {
    const analytics = await getAdminAnalytics();

    res.status(200).json({
      success: true,
      dashboard: {
        title: "CollabX Admin Dashboard",
        analytics,
        modules: [
          "tickets",
          "bookings",
          "payments",
          "chatbot",
          "support_agents",
        ],
      },
    });
  };
