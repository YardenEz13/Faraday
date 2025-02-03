import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';

const router = express.Router();

router.get('/:topic/question', authMiddleware, async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user.id;

    console.log('Generating question for:', {
      topic,
      userId
    });

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get current level from student's progress
    const currentLevel = Math.floor(student.mathLevel) || 1;
    const questionId = Date.now();

    if (topic.toLowerCase() === 'pythagorean') {
      // Scale Pythagorean triples based on level
      const basePythagSets = [
        { a: 3, b: 4, c: 5 },
        { a: 6, b: 8, c: 10 },
        { a: 5, b: 12, c: 13 },
        { a: 9, b: 12, c: 15 },
        { a: 8, b: 15, c: 17 }
      ];
      
      const setIndex = Math.floor((questionId / 1000) % basePythagSets.length);
      const baseSet = basePythagSets[setIndex];
      const multiplier = Math.max(1, Math.min(5, Math.floor(currentLevel / 2)));
      const set = {
        a: baseSet.a * multiplier,
        b: baseSet.b * multiplier,
        c: baseSet.c * multiplier
      };
      
      return res.json({
        id: questionId,
        question: `Find the missing side: ${set.a}^2 + ${set.b}^2 = ?^2`,
        solution: set.c.toString(),
        hints: [
          "Use the Pythagorean theorem: a² + b² = c²",
          `Square ${set.a} and ${set.b}, then add them`,
          "Take the square root of the sum"
        ]
      });
    }

    // Handle other topics similarly...
    res.status(400).json({ error: 'Unsupported topic' });
  } catch (error) {
    console.error('Error generating practice question:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

router.post('/:topic/submit', authMiddleware, async (req, res) => {
  try {
    const { topic, questionId, answer, hintsUsed = 0 } = req.body;
    const userId = req.user.id;

    if (!topic || !questionId || !answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get current level from student's progress
    const currentLevel = Math.floor(student.mathLevel) || 1;

    // Generate the same question based on questionId to get the solution
    let solution;
    let questionDetails = {};

    if (topic.toLowerCase() === 'pythagorean') {
      const basePythagSets = [
        { a: 3, b: 4, c: 5 },
        { a: 6, b: 8, c: 10 },
        { a: 5, b: 12, c: 13 },
        { a: 9, b: 12, c: 15 },
        { a: 8, b: 15, c: 17 }
      ];
      
      const setIndex = Math.floor((questionId / 1000) % basePythagSets.length);
      const baseSet = basePythagSets[setIndex];
      const multiplier = Math.max(1, Math.min(5, Math.floor(currentLevel / 2)));
      const set = {
        a: baseSet.a * multiplier,
        b: baseSet.b * multiplier,
        c: baseSet.c * multiplier
      };
      solution = set.c.toString();
      questionDetails = { setIndex, set, level: currentLevel };
    } else {
      return res.status(400).json({ error: 'Invalid topic' });
    }

    // Compare the answer with the solution
    const isCorrect = answer.toString().trim() === solution.trim();

    // Update student's progress
    if (isCorrect) {
      student.consecutiveCorrect += 1;
      student.consecutiveIncorrect = 0;
      if (student.consecutiveCorrect >= 3) {
        student.mathLevel = Math.min(10, student.mathLevel + 0.2);
      }
    } else {
      student.consecutiveIncorrect += 1;
      student.consecutiveCorrect = 0;
      if (student.consecutiveIncorrect >= 3) {
        student.mathLevel = Math.max(1, student.mathLevel - 0.1);
      }
    }

    await student.save();

    res.json({
      correct: isCorrect,
      message: isCorrect ? 'Correct! Well done!' : 'Incorrect. Try again!',
      points: isCorrect ? (10 - hintsUsed * 2) : 0
    });
  } catch (error) {
    console.error('Error submitting practice answer:', error);
    res.status(500).json({ error: 'Failed to submit practice answer' });
  }
});

export { router as practiceRoutes }; 