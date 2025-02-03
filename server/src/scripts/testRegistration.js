import mongoose from 'mongoose';
import { User } from '../models/User.js';
import "dotenv/config";

const testUser = {
  username: "testteacher",
  email: "test@teacher.com",
  password: "password123",
  role: "teacher"
};

async function testRegistration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear any existing user with same email
    await User.deleteOne({ email: testUser.email });

    // Create new user
    const user = new User(testUser);
    await user.save();

    console.log('Test user created successfully:', {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRegistration(); 