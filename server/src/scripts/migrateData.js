import mysql from 'mysql2/promise';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Assignment } from '../models/Assignment.js';
import "dotenv/config";

const mysqlConfig = {
  host: "localhost",
  user: "root",
  password: "rootrootRoot",
  database: "faraday"
};

async function migrateData() {
  try {
    // Connect to both databases
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to both databases');

    // Migrate users first
    const [users] = await mysqlConnection.execute('SELECT * FROM user');
    const userMap = new Map(); // To store old ID -> new ID mappings

    for (const user of users) {
      const newUser = new User({
        username: user.username,
        email: user.email,
        password: user.password, // Already hashed
        role: user.role,
        mathLevel: user.mathLevel,
        consecutiveCorrect: user.consecutiveCorrect,
        consecutiveIncorrect: user.consecutiveIncorrect
      });

      const savedUser = await newUser.save();
      userMap.set(user.id, savedUser._id);
    }

    console.log('Users migrated successfully');

    // Migrate assignments
    const [assignments] = await mysqlConnection.execute('SELECT * FROM assignment');

    for (const assignment of assignments) {
      const newAssignment = new Assignment({
        title: assignment.title,
        description: assignment.description,
        equation: assignment.equation,
        solution: JSON.parse(assignment.solution),
        hints: assignment.hints ? assignment.hints.split(',') : [],
        dueDate: assignment.dueDate,
        isCompleted: assignment.isCompleted,
        studentAnswer: assignment.studentAnswer,
        isSurrendered: assignment.isSurrendered,
        teacher: userMap.get(assignment.teacherId),
        student: userMap.get(assignment.studentId)
      });

      await newAssignment.save();
    }

    console.log('Assignments migrated successfully');

    await mysqlConnection.end();
    await mongoose.disconnect();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData(); 