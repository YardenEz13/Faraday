import mongoose from 'mongoose';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import "dotenv/config";

async function initDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Create collections and indexes
    await Promise.all([
      User.createCollection(),
      Assignment.createCollection()
    ]);

    // Create indexes
    await Promise.all([
      User.createIndexes(),
      Assignment.createIndexes()
    ]);

    console.log('Database initialized successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDb(); 