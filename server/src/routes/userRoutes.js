import express from "express";
import { createUser, getUser, updateUser, searchUnassignedStudents, assignTeacherToStudent } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Assignment } from "../models/Assignment.js";

const router = express.Router();

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await getUser(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Failed to get user profile:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const updatedUser = await updateUser(req.user.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user profile:', error);
    res.status(400).json({ error: error.message });
  }
});

// Assign student to teacher
router.post("/assign-student/:studentId", authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: "Only teachers can assign students" });
  }
  await assignTeacherToStudent(req, res);
});

// Get teacher's students
router.get("/my-students", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Only teachers can view their students" });
    }

    const students = await User.find({
      role: "student",
      teacher: req.user.id
    }).select('id username email mathLevel');

    res.json(students);
  } catch (error) {
    console.error('Failed to get students:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get unassigned students
router.get("/unassigned-students", authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: "Only teachers can view unassigned students" });
  }
  await searchUnassignedStudents(req, res);
});

// Get student statistics
router.get("/student-statistics", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Only teachers can view student statistics" });
    }

    const students = await User.find({
      role: "student",
      teacher: req.user.id
    });

    const studentStats = await Promise.all(students.map(async (student) => {
      const assignments = await Assignment.find({
        student: student._id
      });

      const totalAssignments = assignments.length;
      const completedAssignments = assignments.filter(a => a.isCompleted).length;
      const completionRate = totalAssignments > 0 
        ? Math.round((completedAssignments / totalAssignments) * 100) 
        : 0;

      return {
        id: student._id,
        name: student.username,
        email: student.email,
        mathLevel: student.mathLevel || 1,
        totalAssignments,
        completedAssignments,
        completionRate,
        streak: student.streak || 0,
        lastActive: student.updatedAt
      };
    }));

    res.json(studentStats);
  } catch (error) {
    console.error('Failed to get student statistics:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as userRoutes }; 