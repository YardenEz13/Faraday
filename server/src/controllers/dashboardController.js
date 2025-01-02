// server/src/controllers/dashboardController.js
import { AppDataSource } from "../config/database.js";
import { User } from "../models/User.js";
import { Assignment } from "../models/Assignment.js";

export const studentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRepository = AppDataSource.getRepository(User);
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    
    const student = await userRepository.findOne({
      where: { id: userId },
      relations: ["teacher"]
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get student's assignments
    const assignments = await assignmentRepository.find({
      where: { student: { id: userId } },
      relations: ["teacher"],
      order: { createdAt: "DESC" }
    });

    return res.json({
      student: {
        id: student.id,
        username: student.username,
        email: student.email,
        mathLevel: student.mathLevel,
        teacher: student.teacher ? {
          id: student.teacher.id,
          username: student.teacher.username,
          email: student.teacher.email
        } : null
      },
      assignments
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    return res.status(500).json({ error: "Failed to fetch student dashboard" });
  }
};

export const teacherDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRepository = AppDataSource.getRepository(User);
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    
    const teacher = await userRepository.findOne({
      where: { id: userId },
      relations: ["students"]
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Get teacher's assignments
    const assignments = await assignmentRepository.find({
      where: { teacher: { id: userId } },
      relations: ["student"],
      order: { createdAt: "DESC" }
    });

    return res.json({
      teacher: {
        id: teacher.id,
        username: teacher.username,
        email: teacher.email,
        students: teacher.students.map(student => ({
          id: student.id,
          username: student.username,
          email: student.email
        }))
      },
      assignments
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    return res.status(500).json({ error: "Failed to fetch teacher dashboard" });
  }
};
