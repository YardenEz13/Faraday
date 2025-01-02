// server/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Make sure we have the necessary user info
    if (!decoded.id) {
      return res.status(401).json({ error: "Invalid token structure" });
    }

    // Set user info in request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Token is not valid" });
  }
};

export const teacherMiddleware = (req, res, next) => {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ message: "Forbidden - Teacher role required" });
  }
  next();
};

export const studentMiddleware = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({ message: "Forbidden - Student role required" });
  }
  next();
};
