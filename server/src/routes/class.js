// server/src/routes/class.js
import { Router } from "express";
import { createClass, getClasses, enrollStudent } from "../controllers/classController.js";
import { authMiddleware, teacherMiddleware } from "../middleware/authMiddleware.js";

export const classRouter = Router();

// Teacher-only routes
classRouter.post("/", authMiddleware, teacherMiddleware, createClass);
classRouter.get("/", authMiddleware, teacherMiddleware, getClasses);
classRouter.post("/:id/enroll", authMiddleware, teacherMiddleware, enrollStudent);
