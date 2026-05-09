import express from "express";

import {
  adminDashboard,
  analyticsPanel,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", adminDashboard);
router.get("/analytics", analyticsPanel);

export default router;
