import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Assignment } from '../models/Assignment.js';
import "dotenv/config";

async function cleanDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Drop collections
    await Promise.all([
      User.collection.drop(),
      Assignment.collection.drop()
    ]);

    console.log('Database cleaned successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Database cleanup failed:', error);
    process.exit(1);
  }
}

cleanDb(); 