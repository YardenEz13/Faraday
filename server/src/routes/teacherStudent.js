// server/routes/teacherStudent.js
import express from "express";
import { AppDataSource } from "../config/database.js";
import { User } from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Link student to teacher
router.post("/link-student-teacher", authenticateToken, async (req, res) => {
  const { teacherId, studentId } = req.body;
  
  try {
    // Verify that the requester is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Only teachers can link students" });
    }

    // Verify that the teacher is linking themselves
    if (req.user.id !== teacherId) {
      return res.status(403).json({ error: "Teachers can only link students to themselves" });
    }

    const userRepository = AppDataSource.getRepository(User);
    
    const [student, teacher] = await Promise.all([
      userRepository.findOne({ 
        where: { id: studentId, role: "student" }
      }),
      userRepository.findOne({ 
        where: { id: teacherId, role: "teacher" }
      })
    ]);

    if (!student || !teacher) {
      return res.status(404).json({ error: "Student or teacher not found" });
    }

    if (student.teacher) {
      return res.status(400).json({ error: "Student is already assigned to a teacher" });
    }

    student.teacher = teacher;
    await userRepository.save(student);

    return res.status(201).json({ 
      message: "Student linked to teacher successfully",
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      }
    });
  } catch (error) {
    console.error("Failed to link student to teacher:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teacher/:teacherId/students", async (req, res) => {
    const { teacherId } = req.params;
    try {
      const [rows] = await pool.query(
        `SELECT s.id AS student_id, s.name AS student_name
         FROM students s
         INNER JOIN teacher_student ts ON s.id = ts.student_id
         WHERE ts.teacher_id = ?`,
        [teacherId]
      );
      return res.json(rows);
    } catch (err) {
      console.error("Failed to get students of teacher:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
export default router;
// server/src/routes/teacherStudent.js