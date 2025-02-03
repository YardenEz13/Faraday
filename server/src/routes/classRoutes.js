import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createClass, getTeacherClasses, addStudentToClass, deleteClass } from '../controllers/classController.js';

const router = express.Router();

// Create a new class
router.post('/', authMiddleware, createClass);

// Get all classes for a teacher
router.get('/', authMiddleware, getTeacherClasses);

// Add student to class
router.post('/add-student', authMiddleware, addStudentToClass);

// Delete a class
router.delete('/:id', authMiddleware, deleteClass);

export default router; 