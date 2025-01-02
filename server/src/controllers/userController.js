import { AppDataSource } from "../config/database.js";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";

// הוספת פונקציה ליצירת משתמש חדש
async function createUser(userData) {
  const userRepository = AppDataSource.getRepository(User);
  
  // בדיקה אם המשתמש כבר קיים
  const existingUser = await userRepository.findOne({ 
    where: { email: userData.email } 
  });
  
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // הצפנת הסיסמה
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // יצירת משתמש חדש
  const user = userRepository.create({
    email: userData.email,
    username: userData.username,
    password: hashedPassword,
    role: userData.role
  });

  return await userRepository.save(user);
}

// קישור תלמיד למורה
async function assignTeacherToStudent(studentId, teacherId) {
  const userRepository = AppDataSource.getRepository(User);
  
  const student = await userRepository.findOne({ 
    where: { id: studentId, role: "student" }
  });
  
  const teacher = await userRepository.findOne({ 
    where: { id: teacherId, role: "teacher" }
  });

  if (!student || !teacher) {
    throw new Error("Student or teacher not found");
  }

  student.teacher = teacher;
  await userRepository.save(student);
}

// שליפת כל התלמידים של מורה
async function getTeacherStudents(teacherId) {
  const userRepository = AppDataSource.getRepository(User);
  const teacher = await userRepository.findOne({
    where: { id: teacherId },
    relations: ["students"]
  });
  return teacher?.students || [];
}

export {
  createUser,
  assignTeacherToStudent,
  getTeacherStudents
}; 