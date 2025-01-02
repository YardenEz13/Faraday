// server/src/routes/auth.js
import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
