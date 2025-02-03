import { User } from "../models/User.js";

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
    console.log('Searching for unassigned students with term:', searchTerm);
    
    // Find unassigned students
    const students = await User.find({
      role: 'student',
      teacher: { $exists: false },  // Only students without a teacher field
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    }).select('username email mathLevel');

    console.log('Found unassigned students:', students);
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