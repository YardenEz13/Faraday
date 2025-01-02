// server/routes/teacherStudent.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// קישור תלמיד למורה (many-to-many)
router.post("/link-student-teacher", async (req, res) => {
  const { teacherId, studentId } = req.body;
  try {
    await pool.query(
      "INSERT INTO teacher_student (teacher_id, student_id) VALUES (?, ?)",
      [teacherId, studentId]
    );
    return res.status(201).json({ message: "Student linked to teacher successfully" });
  } catch (err) {
    console.error("Failed to link student to teacher:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// server/routes/teacherStudent.js (המשך הקובץ)
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