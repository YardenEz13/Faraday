// server/src/routes/index.js
import express from "express";
import { authRoutes } from "./authRoutes.js";
import { userRoutes } from "./userRoutes.js";
import { dashboardRoutes } from "./dashboardRoutes.js";
import { assignmentRoutes } from "./assignmentRoutes.js";
import { practiceRoutes } from "./practiceRoutes.js";
import { aiRoutes } from "./aiRoutes.js";
import { classRoutes } from "./classRoutes.js";

const router = express.Router();

// Mount all routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/practice", practiceRoutes);
router.use('/ai', aiRoutes);
router.use('/classes', classRoutes);

export { router };
