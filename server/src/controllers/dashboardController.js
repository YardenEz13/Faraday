// server/src/controllers/dashboardController.js
import { User } from "../models/User.js";
import { Assignment } from "../models/Assignment.js";

export const studentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const student = await User.findById(userId)
      .populate('teacher', 'username email');

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get student's assignments
    const assignments = await Assignment.find({ student: userId })
      .populate('teacher', 'username email')
      .sort('-createdAt');

    return res.json({
      student: {
        id: student._id,
        username: student.username,
        email: student.email,
        mathLevel: student.mathLevel,
        teacher: student.teacher ? {
          id: student.teacher._id,
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
    console.log('Teacher dashboard request for userId:', userId);
    
    // First, let's check all students in the system
    const allStudents = await User.find({ role: 'student' });
    console.log('All students in system:', allStudents.map(s => ({
      id: s._id,
      username: s.username,
      teacher: s.teacher
    })));
    
    // Find all students assigned to this teacher
    const students = await User.find({ 
      role: 'student',
      teacher: userId 
    });
    
    console.log('Found students for teacher:', students);

    // Get all assignments for each student
    const studentsWithAssignments = await Promise.all(
      students.map(async (student) => {
        const studentAssignments = await Assignment.find({
          student: student._id
        }).sort('-createdAt');

        console.log(`Assignments for student ${student.username}:`, studentAssignments);

        // Calculate student's progress based on completed assignments
        const completedAssignments = studentAssignments.filter(a => a.isCompleted).length;
        const progress = studentAssignments.length > 0 
          ? Math.round((completedAssignments / studentAssignments.length) * 100)
          : 0;

        return {
          id: student._id,
          email: student.email,
          username: student.username,
          level: student.mathLevel || 1,
          progress: progress,
          assignments: studentAssignments.map(assignment => ({
            id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            isCompleted: assignment.isCompleted
          }))
        };
      })
    );

    console.log('Sending response:', studentsWithAssignments);
    return res.json(studentsWithAssignments);
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    return res.status(500).json({ error: "Failed to fetch teacher dashboard" });
  }
};
