// server/src/seed.js
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "./models/User.js";
import "dotenv/config";

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const teacherPasswordHash = await bcrypt.hash("teacher123", 10);
    const studentPasswordHash = await bcrypt.hash("student123", 10);

    const teacher = new User({
      username: "Teacher Alice",
      email: "alice@faraday.com",
      password: teacherPasswordHash,
      role: "teacher"
    });

    const student = new User({
      username: "Student Bob",
      email: "bob@faraday.com",
      password: studentPasswordHash,
      role: "student"
    });

    await Promise.all([teacher.save(), student.save()]);
    console.log("Seed completed!");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();