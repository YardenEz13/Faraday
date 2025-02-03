// server/src/controllers/assignmentController.js
import { Assignment } from "../models/Assignment.js";
import { User } from "../models/User.js";

export const createAssignment = async (req, res) => {
  try {
    const { title, description, equation, solution, hints, dueDate, studentId } = req.body;
    const teacherId = req.user.id;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    const assignment = new Assignment({
      title,
      description,
      equation,
      solution,
      hints,
      dueDate,
      teacher: teacherId,
      student: studentId
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { role, id } = req.user;
    let assignments;

    if (role === 'teacher') {
      assignments = await Assignment.find({ teacher: id })
        .populate('student', 'username email')
        .sort('-createdAt');
    } else {
      assignments = await Assignment.find({ student: id })
        .populate('teacher', 'username email')
        .sort('-createdAt');
    }

    res.json(assignments);
  } catch (error) {
    console.error('Error getting assignments:', error);
    res.status(500).json({ error: 'Failed to get assignments' });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { answer } = req.body;
    const assignmentId = req.params.id;
    const studentId = req.user.id;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      student: studentId
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.isCompleted) {
      return res.status(400).json({ error: 'Assignment already completed' });
    }

    // Update assignment
    assignment.studentAnswer = answer;
    assignment.isCompleted = true;
    await assignment.save();

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
};
