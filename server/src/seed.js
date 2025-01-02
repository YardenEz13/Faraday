// server/src/seed.js
import bcrypt from "bcrypt";
import { createConnection, AppDataSource } from "./config/database.js";

async function seed() {
  try {
    await createConnection();

    const userRepo = AppDataSource.getRepository("User");

    const teacherPasswordHash = await bcrypt.hash("teacher123", 10);
    const studentPasswordHash = await bcrypt.hash("student123", 10);

    const teacher = userRepo.create({
      name: "Teacher Alice",
      email: "alice@faraday.com",
      passwordHash: teacherPasswordHash,
      role: "teacher"
    });

    const student = userRepo.create({
      name: "Student Bob",
      email: "bob@faraday.com",
      passwordHash: studentPasswordHash,
      role: "student"
    });

    await userRepo.save([teacher, student]);
    console.log("Seed completed!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seed();