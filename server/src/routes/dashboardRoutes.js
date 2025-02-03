import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Class from "../models/Class.js";

const router = express.Router();

// Get teacher dashboard data
router.get("/teacher", authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get all classes for this teacher
    const classes = await Class.find({ teacherId });
    const studentIds = classes.reduce((acc, curr) => [...acc, ...curr.students], []);

    // Get all students with their assignments
    const students = await User.find({ 
      _id: { $in: studentIds },
      role: 'student'
    }).select('username email mathLevel');

    // Get all assignments for these students
    const assignments = await Assignment.find({
      $or: [
        { teacherId },
        { student: { $in: studentIds } }
      ]
    }).populate('student', 'username email')
      .populate('classId', 'name');

    console.log('Found assignments:', assignments.length);
    console.log('Found students:', students.length);

    // Group assignments by student
    const studentAssignments = students.map(student => {
      // Filter assignments for this student, ensuring student field exists
      const studentAssignments = assignments.filter(assignment => 
        assignment.student && assignment.student._id && 
        assignment.student._id.toString() === student._id.toString()
      );

      return {
        _id: student._id,
        username: student.username,
        email: student.email,
        mathLevel: student.mathLevel,
        assignments: studentAssignments.map(assignment => ({
          _id: assignment._id,
          title: typeof assignment.title === 'object' ? 
            (assignment.title.en || assignment.title.he) : 
            (assignment.title || 'Untitled Assignment'),
          topic: assignment.topic,
          status: assignment.status,
          dueDate: assignment.dueDate,
          isLate: assignment.isLate,
          grade: assignment.grade,
          className: typeof assignment.classId?.name === 'object' ?
            (assignment.classId.name.en || assignment.classId.name.he) :
            (assignment.classId?.name || 'N/A')
        })),
        stats: {
          totalAssignments: studentAssignments.length,
          completedAssignments: studentAssignments.filter(a => 
            a.status === 'submitted' || a.status === 'graded'
          ).length,
          progress: studentAssignments.length ? 
            Math.round((studentAssignments.filter(a => 
              a.status === 'submitted' || a.status === 'graded'
            ).length / studentAssignments.length) * 100) : 0
        }
      };
    });

    console.log('Sending students with assignments:', JSON.stringify(studentAssignments, null, 2));
    res.json(studentAssignments);
  } catch (error) {
    console.error('Error getting teacher dashboard:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Get student dashboard data
router.get("/student", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can access this data" });
    }

    console.log('Fetching assignments for student:', req.user.id);

    // Get all assignments for this student
    const assignments = await Assignment.find({
      student: req.user.id
    })
    .populate("teacherId", "username email")
    .sort({ dueDate: 1 });

    console.log('Found assignments:', assignments);

    // Fix any assignments with invalid status
    for (const assignment of assignments) {
      if (assignment.status === 'late') {
        console.log(`Fixing invalid status for assignment ${assignment._id}`);
        await Assignment.updateOne(
          { _id: assignment._id },
          { 
            status: assignment.grade != null ? 'submitted' : 'active',
            isLate: true
          }
        );
      }
    }

    // Update late status for assignments
    const now = new Date();
    for (const assignment of assignments) {
      if (assignment.dueDate && new Date(assignment.dueDate) < now && assignment.status === 'active') {
        // Only update if the late status needs to change
        if (!assignment.isLate) {
          console.log(`Marking assignment ${assignment._id} as late`);
          await Assignment.updateOne(
            { _id: assignment._id },
            { isLate: true }
          );
        }
      }
    }

    // Get student data
    const student = await User.findById(req.user.id)
      .select('username email mathLevel topicLevels')
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Re-fetch assignments to get updated data
    const updatedAssignments = await Assignment.find({
      student: req.user.id
    })
    .populate("teacherId", "username email")
    .sort({ dueDate: 1 });

    // Group assignments by status
    const activeAssignments = updatedAssignments.filter(a => 
      a.status === "active" && !a.isLate
    );
    
    const submittedAssignments = updatedAssignments.filter(a => 
      a.status === "submitted" || a.status === "graded"
    );
    
    const lateAssignments = updatedAssignments.filter(a => 
      a.isLate && a.status === "active"
    );

    console.log('Categorized assignments:', {
      active: activeAssignments.length,
      submitted: submittedAssignments.length,
      late: lateAssignments.length,
      total: updatedAssignments.length
    });

    res.json({
      student: {
        ...student,
        mathLevel: student.mathLevel || 1,
        topicLevels: student.topicLevels || {}
      },
      activeAssignments,
      submittedAssignments,
      lateAssignments,
      stats: {
        totalAssignments: updatedAssignments.length,
        completedAssignments: submittedAssignments.length,
        lateAssignments: lateAssignments.length,
        activeAssignments: activeAssignments.length
      }
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

// Get students for teacher
router.get('/teacher/students', authMiddleware, async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      teacher: req.user.id
    }).select("username email mathLevel");

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student details
router.get('/student/:id', authMiddleware, async (req, res) => {
  try {
    // Check if the user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can access student details' });
    }

    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if the student is assigned to this teacher
    if (student.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only view your own students' });
    }

    // Convert topicLevels Map to a plain object
    const topicLevels = Object.fromEntries(student.topicLevels || new Map());

    res.json({
      _id: student._id,
      username: student.username,
      email: student.email,
      mathLevel: student.mathLevel || 1,
      topicLevels
    });
  } catch (error) {
    console.error('Error getting student details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as dashboardRoutes }; 