import {
  getUserActivities,
  trackActivity,
} from "../services/activityService.js";

export const listActivities =
  async (req, res) => {
    try {
      const activities = await getUserActivities(
        req.query.userId
      );

      res.status(200).json({
        success: true,
        activities,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Activity loading failed",
      });
    }
  };

export const createActivity =
  async (req, res) => {
    try {
      const activity = await trackActivity(req.body);

      res.status(201).json({
        success: true,
        activity,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Activity tracking failed",
      });
    }
  };
