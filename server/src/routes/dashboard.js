// server/src/routes/dashboard.js
import { Router } from "express";
import { studentDashboard, teacherDashboard } from "../controllers/dashboardController.js";
import {
  authMiddleware,
  studentMiddleware,
  teacherMiddleware
} from "../middleware/authMiddleware.js";

export const dashboardRouter = Router();

dashboardRouter.get("/student", authMiddleware, studentMiddleware, studentDashboard);
dashboardRouter.get("/teacher", authMiddleware, teacherMiddleware, teacherDashboard);
