// server/src/controllers/classController.js
import Class from "../models/Class.js";
import User from "../models/User.js";

export const createClass = async (req, res) => {
  try {
    const { name, studentIds = [] } = req.body;
    const teacherId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: "Class name is required" });
    }

    // Create the class
    const newClass = new Class({
      name,
      teacherId,
      students: studentIds
    });

    // If there are students to add, validate and update them
    if (studentIds.length > 0) {
      // Validate that all students exist and are either unassigned or belong to this teacher
      const students = await User.find({
        _id: { $in: studentIds },
        role: 'student',
        $or: [
          { teacher: { $exists: false } },  // Unassigned students
          { teacher: teacherId }            // Students already assigned to this teacher
        ]
      });

      if (students.length !== studentIds.length) {
        return res.status(400).json({ message: "Some students were not found or are already assigned to another teacher" });
      }

      // Assign the teacher to any unassigned students
      await User.updateMany(
        {
          _id: { $in: studentIds },
          teacher: { $exists: false }
        },
        {
          $set: { teacher: teacherId }
        }
      );
    }

    await newClass.save();
    return res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const classes = await Class.find({ teacherId })
      .populate('students', 'username email mathLevel');
    
    return res.json(classes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addStudentToClass = async (req, res) => {
  try {
    const { studentId, classId } = req.body;
    const teacherId = req.user.id;

    if (!studentId || !classId) {
      return res.status(400).json({ error: 'Student ID and Class ID are required' });
    }

    // Find the class and verify it belongs to the teacher
    const classDoc = await Class.findOne({ _id: classId, teacherId });
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found or unauthorized' });
    }

    // Find the student and verify they exist
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student is already in this class
    if (classDoc.students.includes(studentId)) {
      return res.status(400).json({ error: 'Student is already in this class' });
    }

    // Add student to class if not already added
    const updated = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: studentId } },
      { new: true }
    );

    // Update student's teacher if not already set
    if (!student.teacher) {
      await User.findByIdAndUpdate(studentId, {
        teacher: teacherId
      });
    }

    return res.json({ message: 'Student added successfully', class: updated });
  } catch (error) {
    console.error('Error adding student:', error);
    return res.status(500).json({ error: 'Failed to add student' });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user._id;

    // Find the class and verify it belongs to the teacher
    const classDoc = await Class.findOne({ _id: id, teacher: teacherId });
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found or unauthorized' });
    }

    // Delete the class
    await Class.findByIdAndDelete(id);

    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Error deleting class' });
  }
};
