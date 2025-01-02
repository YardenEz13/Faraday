// server/src/routes/assignment.js
import { Router } from "express";
import {
  createAssignment,
  getAssignments,
  submitAssignment
} from "../controllers/assignmentController.js";
import {
  authMiddleware,
  teacherMiddleware,
  studentMiddleware
} from "../middleware/authMiddleware.js";

export const assignmentRouter = Router();

assignmentRouter.post("/", authMiddleware, teacherMiddleware, createAssignment);
assignmentRouter.get("/", authMiddleware, getAssignments);
assignmentRouter.post("/:assignmentId/submit", authMiddleware, studentMiddleware, submitAssignment);
