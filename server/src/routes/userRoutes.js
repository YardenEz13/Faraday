import express from "express";
import { createUser, assignTeacherToStudent, getTeacherStudents } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { AppDataSource } from "../config/database.js";
import { User } from "../models/User.js";
import { Assignment } from "../models/Assignment.js";

const router = express.Router();

// הוספת משתמש חדש
router.post("/users", async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await createUser(userData);
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// קישור תלמיד למורה
router.post("/assign-teacher", async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;
    await assignTeacherToStudent(studentId, teacherId);
    res.json({ message: "Teacher assigned successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// שליפת תלמידים של מורה
router.get("/teacher-students/:teacherId", async (req, res) => {
  try {
    const students = await getTeacherStudents(req.params.teacherId);
    res.json(students);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/unassigned-students', authMiddleware, async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    // Find students who don't have a teacher assigned
    const unassignedStudents = await userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'student' })
      .andWhere('user.teacherId IS NULL') // Only get students with no teacher
      .getMany();

    res.json(unassignedStudents);
  } catch (error) {
    console.error('Error fetching unassigned students:', error);
    res.status(500).json({ error: 'Failed to fetch unassigned students' });
  }
});

router.post('/assign-student/:studentId', authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const studentId = req.params.studentId;
    
    const userRepository = AppDataSource.getRepository(User);
    
    // Find the student and teacher
    const [student, teacher] = await Promise.all([
      userRepository.findOne({ 
        where: { id: studentId, role: 'student' }
      }),
      userRepository.findOne({ 
        where: { id: teacherId, role: 'teacher' }
      })
    ]);

    if (!student || !teacher) {
      return res.status(404).json({ error: 'Student or teacher not found' });
    }

    // Check if student is already assigned
    if (student.teacherId) {
      return res.status(400).json({ error: 'Student is already assigned to a teacher' });
    }

    // Assign the student to the teacher
    student.teacherId = teacherId;
    await userRepository.save(student);

    res.json({ message: 'Student assigned successfully' });
  } catch (error) {
    console.error('Error assigning student:', error);
    res.status(500).json({ error: 'Failed to assign student' });
  }
});

// Add this new endpoint to get student statistics
router.get('/student-statistics', authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const userRepository = AppDataSource.getRepository(User);
    const assignmentRepository = AppDataSource.getRepository(Assignment);

    // Get all students for this teacher
    const teacher = await userRepository.findOne({
      where: { id: teacherId },
      relations: ['students']
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Get statistics for each student
    const statistics = await Promise.all(teacher.students.map(async (student) => {
      const assignments = await assignmentRepository.find({
        where: {
          student: { id: student.id },
          teacher: { id: teacherId }
        }
      });

      const totalAssignments = assignments.length;
      const completedAssignments = assignments.filter(a => a.isCompleted).length;

      return {
        id: student.id,
        username: student.username,
        email: student.email,
        totalAssignments,
        completedAssignments,
        completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments * 100).toFixed(1) : 0
      };
    }));

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching student statistics:', error);
    res.status(500).json({ error: 'Failed to fetch student statistics' });
  }
});

export { router as userRoutes }; 