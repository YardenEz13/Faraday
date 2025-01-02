import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import fetch from 'node-fetch';
import { AppDataSource } from '../config/database.js';
import { Assignment } from '../models/Assignment.js';
import { User } from '../models/User.js';

const router = express.Router();

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { prompt, studentId } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    
    const student = await userRepository.findOne({
      where: { id: studentId }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const currentLevel = student.mathLevel;
    
    // Create a simpler, more direct prompt
    let questionPrompt = '';
    if (prompt.toLowerCase().includes('pythagorean')) {
      // For Pythagorean theorem, use predefined number sets
      const pythagSets = [
        { a: 3, b: 4, c: 5 },
        { a: 6, b: 8, c: 10 },
        { a: 5, b: 12, c: 13 },
        { a: 9, b: 12, c: 15 },
        { a: 8, b: 15, c: 17 }
      ];
      const set = pythagSets[Math.floor(Math.random() * pythagSets.length)];
      
      questionPrompt = `Generate a math question with this exact format:
Title: Pythagorean theorem
Question: Find the missing side: ${set.a}^2 + ${set.b}^2 = ?^2
Solution: ${set.c}`;
    } else if (prompt.toLowerCase().includes('addition')) {
      const num1 = Math.floor(Math.random() * 90) + 10; // Random number between 10-99
      const num2 = Math.floor(Math.random() * 90) + 10;
      questionPrompt = `Generate a math question with this exact format:
Title: Addition
Question: Calculate: ${num1} + ${num2} = ?
Solution: ${num1 + num2}`;
    } else if (prompt.toLowerCase().includes('multiplication')) {
      const num1 = Math.floor(Math.random() * 11) + 2; // Random number between 2-12
      const num2 = Math.floor(Math.random() * 11) + 2;
      questionPrompt = `Generate a math question with this exact format:
Title: Multiplication
Question: Calculate: ${num1} × ${num2} = ?
Solution: ${num1 * num2}`;
    } else {
      // Default to simple addition if topic not recognized
      const num1 = Math.floor(Math.random() * 90) + 10;
      const num2 = Math.floor(Math.random() * 90) + 10;
      questionPrompt = `Generate a math question with this exact format:
Title: ${prompt}
Question: Calculate: ${num1} + ${num2} = ?
Solution: ${num1 + num2}`;
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: questionPrompt,
          parameters: {
            max_length: 100,
            temperature: 0.1,
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API response not ok: ${response.statusText}`);
    }

    const apiResponse = await response.json();
    console.log("Raw API Response:", apiResponse);

    let text = '';
    if (Array.isArray(apiResponse) && apiResponse[0]?.generated_text === '') {
      // If AI returns empty response, use our generated question directly
      text = questionPrompt;
    } else if (Array.isArray(apiResponse)) {
      text = apiResponse[0]?.generated_text || questionPrompt;
    } else if (typeof apiResponse === 'object') {
      text = apiResponse.generated_text || questionPrompt;
    }

    console.log("Generated Text:", text);

    // Parse the response
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let title = '', description = '', solution = '';

    for (const line of lines) {
      if (line.startsWith('Title:')) {
        title = line.replace('Title:', '').trim();
      } else if (line.startsWith('Question:')) {
        description = line.replace('Question:', '').trim();
      } else if (line.startsWith('Solution:')) {
        solution = line.replace('Solution:', '').trim();
      }
    }

    // If parsing failed, extract from our original prompt
    if (!title || !description || !solution) {
      const promptLines = questionPrompt.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      for (const line of promptLines) {
        if (line.startsWith('Title:')) {
          title = line.replace('Title:', '').trim();
        } else if (line.startsWith('Question:')) {
          description = line.replace('Question:', '').trim();
        } else if (line.startsWith('Solution:')) {
          solution = line.replace('Solution:', '').trim();
        }
      }
    }

    const finalResult = {
      title,
      description,
      solution: solution.toString(),
      difficulty: currentLevel
    };

    console.log("Final result:", finalResult);
    res.json(finalResult);

  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'Failed to generate assignment: ' + error.message,
      details: error.stack
    });
  }
});

// Helper function to get difficulty description
function getDifficultyDescription(level) {
  if (level < 1.5) return "basic arithmetic (addition, subtraction)";
  if (level < 2.5) return "multiplication, division, and simple fractions";
  if (level < 3.5) return "pre-algebra and basic equations";
  if (level < 4.5) return "algebra and word problems";
  return "advanced algebra and complex word problems";
}

router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { studentId, title, description, solution, dueDate } = req.body;
    const teacherId = req.user.id;

    if (!studentId || !title || !description || !solution) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const assignmentRepository = AppDataSource.getRepository(Assignment);

    // Find the teacher and student
    const [teacher, student] = await Promise.all([
      userRepository.findOne({ 
        where: { id: teacherId, role: "teacher" }
      }),
      userRepository.findOne({ 
        where: { id: studentId, role: "student" }
      })
    ]);

    if (!teacher || !student) {
      return res.status(404).json({ error: 'Teacher or student not found' });
    }

    // Create new assignment with solution
    const newAssignment = assignmentRepository.create({
      title,
      description,
      solution,
      dueDate: dueDate ? new Date(dueDate) : null,
      teacher,
      student,
      isCompleted: false
    });

    await assignmentRepository.save(newAssignment);

    res.status(201).json({
      message: 'Assignment sent successfully',
      assignment: {
        id: newAssignment.id,
        title: newAssignment.title,
        description: newAssignment.description,
        dueDate: newAssignment.dueDate
      }
    });
  } catch (error) {
    console.error('Error sending assignment:', error);
    res.status(500).json({ error: 'Failed to send assignment: ' + error.message });
  }
});

router.get('/student-assignments', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    
    const assignments = await assignmentRepository.find({
      where: { 
        student: { id: studentId } 
      },
      relations: ['teacher'],
      order: {
        createdAt: 'DESC'
      }
    });

    // Map the assignments to include only necessary data
    const mappedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      isCompleted: assignment.isCompleted,
      studentAnswer: assignment.studentAnswer,
      solution: assignment.isCompleted ? assignment.solution : undefined,
      teacher: {
        id: assignment.teacher.id,
        username: assignment.teacher.username
      },
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt
    }));

    res.json(mappedAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Get a specific assignment with details
router.get('/assignment/:id', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;
    
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    const assignment = await assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['student', 'teacher']
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if the user is either the student or teacher of this assignment
    if (assignment.student.id !== userId && assignment.teacher.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this assignment' });
    }

    // Don't send solution if user is student and assignment isn't completed
    if (assignment.student.id === userId && !assignment.isCompleted) {
      delete assignment.solution;
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Submit an answer to an assignment
router.post('/submit-answer/:id', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { answer } = req.body;
    const studentId = req.user.id;

    if (!answer) {
      return res.status(400).json({ 
        isCorrect: false,
        message: 'Answer is required' 
      });
    }

    const assignmentRepository = AppDataSource.getRepository(Assignment);
    const userRepository = AppDataSource.getRepository(User);

    const assignment = await assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['student']
    });

    if (!assignment) {
      return res.status(404).json({ 
        isCorrect: false,
        message: 'Assignment not found' 
      });
    }

    if (assignment.student.id !== studentId) {
      return res.status(403).json({ 
        isCorrect: false,
        message: 'Not authorized to submit answer for this assignment' 
      });
    }

    if (assignment.isCompleted) {
      return res.status(400).json({ 
        isCorrect: false,
        message: 'Assignment already completed' 
      });
    }

    const student = await userRepository.findOne({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ 
        isCorrect: false,
        message: 'Student not found' 
      });
    }

    // Make sure we're comparing strings and trimming whitespace
    const isCorrect = answer.toString().trim() === assignment.solution.toString().trim();

    // Update student's level based on performance
    if (isCorrect) {
      student.consecutiveCorrect = (student.consecutiveCorrect || 0) + 1;
      student.consecutiveIncorrect = 0;
      
      // Increase level if student got 3 questions right in a row
      if (student.consecutiveCorrect >= 3) {
        student.mathLevel = Math.min(5.0, (student.mathLevel || 1.0) + 0.2);
        student.consecutiveCorrect = 0;
      }
    } else {
      student.consecutiveIncorrect = (student.consecutiveIncorrect || 0) + 1;
      student.consecutiveCorrect = 0;
      
      // Decrease level if student got 2 questions wrong in a row
      if (student.consecutiveIncorrect >= 2) {
        student.mathLevel = Math.max(1.0, (student.mathLevel || 1.0) - 0.1);
        student.consecutiveIncorrect = 0;
      }
    }

    await userRepository.save(student);

    if (isCorrect) {
      assignment.studentAnswer = answer;
      assignment.isCompleted = true;
      await assignmentRepository.save(assignment);
      
      res.json({ 
        isCorrect: true,
        message: 'Correct! Assignment completed successfully.',
        newLevel: student.mathLevel
      });
    } else {
      res.json({ 
        isCorrect: false,
        message: 'Incorrect answer. Please try again.',
        newLevel: student.mathLevel
      });
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ 
      isCorrect: false,
      message: 'Failed to submit answer',
      error: error.message 
    });
  }
});

router.get('/teacher-assignments', authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    
    const assignments = await assignmentRepository.find({
      where: { 
        teacher: { id: teacherId } 
      },
      relations: ['student'],
      order: {
        dueDate: 'ASC'
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

router.delete('/assignment/:id', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const teacherId = req.user.id;
    
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    const assignment = await assignmentRepository.findOne({
      where: { 
        id: assignmentId,
        teacher: { id: teacherId }
      },
      relations: ['teacher']
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Only allow teachers to delete their own assignments
    if (assignment.teacher.id !== teacherId) {
      return res.status(403).json({ error: 'Not authorized to delete this assignment' });
    }

    await assignmentRepository.remove(assignment);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// Add this new endpoint for getting hints
router.get('/hint/:id', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const studentId = req.user.id;
    
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    const assignment = await assignmentRepository.findOne({
      where: { 
        id: assignmentId,
        student: { id: studentId }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Generate hint using AI
    const response = await fetch(
      "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `For this math problem: ${assignment.description}
          
          Give a short, direct hint like in a math textbook.
          Examples:
          - "Use the Pythagorean theorem: a² + b² = c²"
          - "Remember to isolate x on one side"
          - "Multiply before adding"
          
          Keep it to one short sentence.`,
          parameters: {
            max_length: 50,
            temperature: 0.3,
            return_full_text: false
          }
        }),
      }
    );

    const result = await response.json();
    const hint = result[0].generated_text.trim();

    res.json({ hint });
  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

// Add this new endpoint for surrendering and getting an easier question
router.post('/surrender/:id', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const studentId = req.user.id;
    
    const assignmentRepository = AppDataSource.getRepository(Assignment);
    const userRepository = AppDataSource.getRepository(User);

    const [assignment, student] = await Promise.all([
      assignmentRepository.findOne({
        where: { id: assignmentId, student: { id: studentId } },
        relations: ['teacher']
      }),
      userRepository.findOne({
        where: { id: studentId }
      })
    ]);

    if (!assignment || !student) {
      return res.status(404).json({ error: 'Assignment or student not found' });
    }

    // Update student's level
    if (student.mathLevel > 1.0) {
      student.mathLevel = Math.max(1.0, student.mathLevel - 0.1);
      await userRepository.save(student);
    }

    // Generate an easier question if not at lowest level
    if (student.mathLevel > 1.0) {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
          body: JSON.stringify({
            inputs: `Generate an easier version of this math question: ${assignment.description}

            Rules:
            1. Format must be exactly:
            Title: [Same topic]
            Description: [Simpler version with smaller numbers or fewer steps]
            Solution: [Just the numerical answer]

            2. Make it significantly easier but same concept.
            3. Use simple, whole numbers.
            4. Keep it direct and clear like a textbook exercise.
            5. The solution must be a single number.`,
            parameters: {
              max_length: 200,
              temperature: 0.3,
              return_full_text: false
            }
          }),
        }
      );

      const result = await response.json();
      // Parse the response similar to the generate endpoint
      // ... (reuse your existing parsing logic)

      // Create new assignment
      const newAssignment = assignmentRepository.create({
        title,
        description,
        solution,
        dueDate: assignment.dueDate,
        teacher: assignment.teacher,
        student,
        difficulty: student.mathLevel
      });

      await assignmentRepository.save(newAssignment);

      // Mark the old assignment as completed (surrendered)
      assignment.isCompleted = true;
      assignment.isSurrendered = true;
      await assignmentRepository.save(assignment);

      res.json({
        message: 'New easier assignment generated',
        newAssignment: {
          id: newAssignment.id,
          title: newAssignment.title,
          description: newAssignment.description,
          difficulty: newAssignment.difficulty
        },
        newLevel: student.mathLevel
      });
    } else {
      // At lowest level, just show the solution
      assignment.isCompleted = true;
      assignment.isSurrendered = true;
      await assignmentRepository.save(assignment);

      res.json({
        message: 'You are at the lowest level. Here is the solution to help you learn.',
        solution: assignment.solution,
        explanation: `The correct answer is ${assignment.solution}. Keep practicing to improve!`
      });
    }
  } catch (error) {
    console.error('Error processing surrender:', error);
    res.status(500).json({ error: 'Failed to process surrender' });
  }
});

export { router as assignmentRoutes }; 