import express from 'express';
import { generateMathQuestion } from '../controllers/aiController.js';

const router = express.Router();

// Route for generating math questions
router.post('/generate', generateMathQuestion);

export { router as aiRoutes }; 