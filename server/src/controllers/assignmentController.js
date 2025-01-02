// server/src/controllers/assignmentController.js
import { AppDataSource } from "../config/database.js";

export const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classId } = req.body;
    const userId = req.user.userId;
    const assignmentRepo = AppDataSource.getRepository("Assignment");
    const classRepo = AppDataSource.getRepository("ClassEntity");
    const userRepo = AppDataSource.getRepository("User");

    const classEntity = await classRepo.findOne({ where: { id: classId } });
    if (!classEntity) {
      return res.status(404).json({ message: "Class not found" });
    }

    const creator = await userRepo.findOne({ where: { id: userId } });
    if (!creator) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const assignment = assignmentRepo.create({
      title,
      description,
      dueDate,
      class: classEntity,
      creator
    });
    await assignmentRepo.save(assignment);

    return res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const assignmentRepo = AppDataSource.getRepository("Assignment");
    const assignments = await assignmentRepo.find({
      relations: ["class", "creator"]
    });
    return res.json(assignments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId, 10);
    const { answer } = req.body;
    const userId = req.user.userId;

    const assignmentRepo = AppDataSource.getRepository("Assignment");
    const answerRepo = AppDataSource.getRepository("StudentAnswer");
    const userRepo = AppDataSource.getRepository("User");

    const assignment = await assignmentRepo.findOne({ where: { id: assignmentId } });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const student = await userRepo.findOne({ where: { id: userId } });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentAnswer = answerRepo.create({
      answer,
      student,
      assignment
    });
    await answerRepo.save(studentAnswer);

    return res.status(201).json({ message: "Assignment submitted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
