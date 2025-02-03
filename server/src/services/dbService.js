import mongoose from 'mongoose';

export class DbService {
  static async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB Atlas');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB Atlas');
    } catch (error) {
      console.error('Database disconnection failed:', error);
      throw error;
    }
  }

  static async transaction(callback) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
} 