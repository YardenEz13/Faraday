// server/src/index.js
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import { authRoutes } from "./routes/authRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { assignmentRoutes } from "./routes/assignmentRoutes.js";
import { practiceRoutes } from "./routes/practiceRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "dotenv/config";

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173'||'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/classes", classRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();