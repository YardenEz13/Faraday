import express from "express";
import { createUser, getUser, updateUser, searchUnassignedStudents, assignTeacherToStudent, assignStudentToTeacher } from "../controllers/userController.js";
import { authMiddleware, teacherMiddleware } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";

const router = express.Router();

// Profile routes
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Teacher-student management routes
router.get("/students", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      teacher: req.user.id
    }).select('_id username email mathLevel streak updatedAt');

    const studentStats = await Promise.all(students.map(async (student) => {
      const assignments = await Assignment.find({ student: student._id });
      const totalAssignments = assignments.length;
      const completedAssignments = assignments.filter(a => a.isCompleted).length;
      const completionRate = totalAssignments > 0 
        ? Math.round((completedAssignments / totalAssignments) * 100) 
        : 0;

      return {
        id: student._id,
        username: student.username,
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
    console.error('Failed to get students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Get unassigned students
router.get("/unassigned-students", authMiddleware, teacherMiddleware, searchUnassignedStudents);

// Assign student to teacher
router.post("/assign-student", authMiddleware, teacherMiddleware, assignStudentToTeacher);

export { router as userRoutes }; 