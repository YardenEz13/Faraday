import User from "../models/User.js";

export const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateUser = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const searchUnassignedStudents = async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const mode = req.query.mode || 'teacher'; // 'teacher' or 'class'
    const classId = req.query.classId;
    const teacherId = req.user.id;

    let query = {
      role: 'student'
    };

    // Add search term condition if provided
    if (searchTerm) {
      query.$or = [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Different query based on mode
    if (mode === 'class' && classId) {
      // For class mode: find students who are assigned to this teacher but not in this class
      query.teacher = teacherId;
      query.classes = { $ne: classId };
    } else {
      // For teacher mode: find students who are not assigned to any teacher
      query.$or = [
        { teacher: { $exists: false } },
        { teacher: null }
      ];
    }

    const students = await User.find(query).select('username email mathLevel');
    console.log('Found students:', students);
    return res.json(students);
  } catch (error) {
    console.error('Error searching students:', error);
    return res.status(500).json({ error: 'Failed to search students' });
  }
};

export const assignTeacherToStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user.id;
    console.log('Assigning student to teacher:', { studentId, teacherId });

    // Find the student and check their status
    const student = await User.findById(studentId);
    
    // Validate student exists and is a student
    if (!student || student.role !== 'student') {
      console.log('Student not found or not a student role:', student);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if student already has a teacher
    if (student.teacher) {
      console.log('Student already has a teacher:', student.teacher);
      return res.status(400).json({ error: 'Student already has a teacher' });
    }

    // Update the student with the teacher reference
    student.teacher = teacherId;
    await student.save();

    // Return the updated student
    return res.json({ 
      message: 'Teacher assigned successfully',
      student: {
        id: student._id,
        username: student.username,
        email: student.email,
        mathLevel: student.mathLevel
      }
    });
  } catch (error) {
    console.error('Error assigning teacher:', error);
    return res.status(500).json({ error: 'Failed to assign teacher' });
  }
};

export const assignStudentToTeacher = async (req, res) => {
  try {
    const { studentId } = req.body;
    const teacherId = req.user.id;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Find the student and verify they exist and are not already assigned
    const student = await User.findOne({ 
      _id: studentId, 
      role: 'student',
      $or: [
        { teacher: { $exists: false } },
        { teacher: null }
      ]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found or already assigned to a teacher' });
    }

    // Update student's teacher
    await User.findByIdAndUpdate(studentId, {
      teacher: teacherId
    });

    return res.json({ message: 'Student assigned successfully' });
  } catch (error) {
    console.error('Error assigning student:', error);
    return res.status(500).json({ error: 'Failed to assign student' });
  }
};

export const getUnassignedStudents = async (req, res) => {
  try {
    // Find students who are not assigned to any teacher
    const students = await User.find({
      role: 'student',
      $or: [
        { teacher: { $exists: false } },
        { teacher: null }
      ]
    }).select('username email mathLevel');

    return res.json(students);
  } catch (error) {
    console.error('Error getting unassigned students:', error);
    return res.status(500).json({ error: 'Failed to get unassigned students' });
  }
};

console.log('Search criteria:', {
  role: 'student',
  classes: { $exists: false }
}); 