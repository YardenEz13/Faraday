import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getPracticeQuestion, submitPracticeAnswer } from '../controllers/practiceController.js';

const router = express.Router();

// Get practice question for specific topic
router.get('/:topic', authMiddleware, getPracticeQuestion);

// Submit answer for practice question
router.post('/:topic/answer', authMiddleware, submitPracticeAnswer);

export { router as practiceRoutes }; 