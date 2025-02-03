import mongoose from 'mongoose';
import { User } from '../models/User.js';
import "dotenv/config";

async function createTeacher() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const teacher = new User({
      username: 'teacher1',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'teacher'
    });

    await teacher.save();
    console.log('Teacher created successfully:', {
      id: teacher._id,
      username: teacher.username,
      email: teacher.email,
      role: teacher.role
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Failed to create teacher:', error);
  }
}

createTeacher(); 