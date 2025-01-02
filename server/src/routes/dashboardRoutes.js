import express from "express";
import { studentDashboard, teacherDashboard } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/student", authMiddleware, async (req, res) => {
  try {
    await studentDashboard(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/teacher", authMiddleware, async (req, res) => {
  try {
    await teacherDashboard(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as dashboardRoutes }; 