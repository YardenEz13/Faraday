// server/src/controllers/classController.js
import { AppDataSource } from "../config/database.js";
import { ClassEntity } from "../models/ClassEntity.js";
import { User } from "../models/User.js";

export const createClass = async (req, res) => {
  try {
    const { className } = req.body;
    const userId = req.user.userId;
    const classRepo = AppDataSource.getRepository("ClassEntity");
    const userRepo = AppDataSource.getRepository("User");

    const teacher = await userRepo.findOne({ where: { id: userId } });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const newClass = classRepo.create({
      className,
      teacher
    });

    await classRepo.save(newClass);
    return res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getClasses = async (req, res) => {
  try {
    const classRepo = AppDataSource.getRepository("ClassEntity");
    const classes = await classRepo.find({
      relations: ["teacher"]
    });

    return res.json(classes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const enrollStudent = async (req, res) => {
  try {
    // ניתן לממש לוגיקה לרישום תלמידים, למשל טבלת many-to-many
    // זה רק פלייסהולדר לדוגמה
    return res.json({ message: "Student enrolled successfully (placeholder)" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
