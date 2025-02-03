import mongoose from 'mongoose';
import "dotenv/config";

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testConnection(); 