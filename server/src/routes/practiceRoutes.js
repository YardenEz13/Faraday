import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { AppDataSource } from '../config/database.js';
import { User } from '../models/User.js';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/:topic/question', authMiddleware, async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user.id;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const student = await userRepository.findOne({
      where: { id: userId }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Create a simpler, more direct prompt based on the topic
    let questionPrompt = '';
    if (topic.toLowerCase() === 'pythagorean') {
      const pythagSets = [
        { a: 3, b: 4, c: 5 },
        { a: 6, b: 8, c: 10 },
        { a: 5, b: 12, c: 13 },
        { a: 9, b: 12, c: 15 },
        { a: 8, b: 15, c: 17 }
      ];
      const set = pythagSets[Math.floor(Math.random() * pythagSets.length)];
      
      return res.json({
        id: Date.now(),
        question: `Find the missing side: ${set.a}^2 + ${set.b}^2 = ?^2`,
        solution: set.c.toString(),
        hints: [
          "Use the Pythagorean theorem: a² + b² = c²",
          `Square ${set.a} and ${set.b}, then add them`,
          "Take the square root of the sum"
        ]
      });
    } else if (topic.toLowerCase() === 'addition') {
      const num1 = Math.floor(Math.random() * 90) + 10;
      const num2 = Math.floor(Math.random() * 90) + 10;
      
      return res.json({
        id: Date.now(),
        question: `Calculate: ${num1} + ${num2} = ?`,
        solution: (num1 + num2).toString(),
        hints: [
          "Break down the numbers into tens and ones",
          `Start with ${num1} and count up ${num2}`,
          "Add the ones first, then the tens"
        ]
      });
    } else if (topic.toLowerCase() === 'multiplication') {
      const num1 = Math.floor(Math.random() * 11) + 2;
      const num2 = Math.floor(Math.random() * 11) + 2;
      
      return res.json({
        id: Date.now(),
        question: `Calculate: ${num1} × ${num2} = ?`,
        solution: (num1 * num2).toString(),
        hints: [
          `Think of ${num1} groups of ${num2}`,
          "Use the multiplication table",
          "Break it down into smaller multiplications"
        ]
      });
    }

    return res.status(400).json({ error: 'Invalid topic' });
  } catch (error) {
    console.error('Error generating practice question:', error);
    res.status(500).json({ error: 'Failed to generate practice question' });
  }
});

router.post('/:topic/submit', authMiddleware, async (req, res) => {
  try {
    const { topic } = req.params;
    const { questionId, answer, hintsUsed } = req.body;
    const userId = req.user.id;

    if (!topic || !questionId || !answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const student = await userRepository.findOne({
      where: { id: userId }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // In a real application, you would validate the answer against the stored question
    // For now, we'll just return a success response
    res.json({
      correct: true,
      message: 'Answer submitted successfully',
      points: 10 - hintsUsed * 2
    });
  } catch (error) {
    console.error('Error submitting practice answer:', error);
    res.status(500).json({ error: 'Failed to submit practice answer' });
  }
});

export { router as practiceRoutes }; 