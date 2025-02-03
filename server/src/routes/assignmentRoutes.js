import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { Assignment } from '../models/Assignment.js';
import { User } from '../models/User.js';

const router = express.Router();

// Send assignment to student
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { studentId, title, description, equation, hints, dueDate } = req.body;
    const teacherId = req.user.id;

    console.log('Received assignment data:', {
      studentId,
      title,
      description,
      equation,
      hints,
      dueDate
    });

    // Validate required fields
    if (!studentId || !title || !description || !equation || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if student exists and is assigned to this teacher
    const student = await User.findOne({ 
      _id: studentId, 
      role: 'student',
      teacher: teacherId 
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found or not assigned to you' });
    }

    // Calculate solution for the equation
    const solution = calculateSolution(equation);
    console.log('Calculated solution:', solution);

    // Create new assignment
    const assignment = new Assignment({
      title,
      description,
      equation,
      solution,
      hints: hints || [],
      dueDate,
      teacher: teacherId,
      student: studentId
    });

    await assignment.save();
    console.log('Assignment created:', assignment);

    res.status(201).json({
      message: 'Assignment sent successfully',
      assignment: {
        id: assignment._id,
        title: assignment.title,
        dueDate: assignment.dueDate
      }
    });
  } catch (error) {
    console.error('Error sending assignment:', error);
    res.status(500).json({ error: 'Failed to send assignment' });
  }
});

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;

    // Create a structured math problem
    const mathProblem = {
      title: "מערכת משוואות לינאריות",
      description: "פתור את מערכת המשוואות הבאה ומצא את ערכי X ו-Y",
      equation: "",
      solution: {
        steps: [],
        final_answers: {
          x: "",
          y: ""
        }
      },
      hints: []
    };

    // Generate random numbers for a system of two linear equations
    const a1 = Math.floor(Math.random() * 3) + 1;
    const b1 = Math.floor(Math.random() * 3) + 1;
    const c1 = Math.floor(Math.random() * 10) + 1;
    
    let a2 = Math.floor(Math.random() * 3) + 1;
    const b2 = Math.floor(Math.random() * 3) + 1;
    const c2 = Math.floor(Math.random() * 10) + 1;

    // Make sure we don't have parallel lines
    if (a1 * b2 === a2 * b1) {
      a2 = a1 + 1;
    }

    mathProblem.equation = `${a1}x + ${b1}y = ${c1}\n${a2}x + ${b2}y = ${c2}`;
    
    // Calculate solution using Cramer's rule
    const D = a1 * b2 - a2 * b1;
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;
    
    const x = Dx / D;
    const y = Dy / D;

    mathProblem.solution.steps = [
      `נשתמש בשיטת קרמר לפתרון המערכת:`,
      `משוואה 1: ${a1}x + ${b1}y = ${c1}`,
      `משוואה 2: ${a2}x + ${b2}y = ${c2}`,
      `נחשב את הדטרמיננטה D = ${a1}⋅${b2} - ${a2}⋅${b1} = ${D}`,
      `נחשב את Dx = ${c1}⋅${b2} - ${c2}⋅${b1} = ${Dx}`,
      `נחשב את Dy = ${a1}⋅${c2} - ${a2}⋅${c1} = ${Dy}`,
      `x = Dx/D = ${x}`,
      `y = Dy/D = ${y}`
    ];

    mathProblem.solution.final_answers = {
      x: x.toString(),
      y: y.toString()
    };

    mathProblem.hints = [
      "אפשר להשתמש בשיטת ההצבה - לבודד משתנה אחד ולהציב במשוואה השנייה",
      "אפשר להשתמש בשיטת החיבור - לבטל משתנה על ידי כפל וחיבור המשוואות",
      "אפשר להשתמש בשיטת קרמר - לחשב דטרמיננטות"
    ];

    res.json(mathProblem);
  } catch (error) {
    console.error('Error generating assignment:', error);
    res.status(500).json({ error: 'Failed to generate assignment' });
  }
});

router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { answer } = req.body;
    const studentId = req.user.id;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      student: studentId
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.isCompleted) {
      return res.status(400).json({ error: 'Assignment already completed' });
    }

    // Parse the submitted answer and the correct solution
    const submittedAnswer = answer.replace(/\s+/g, '').toLowerCase();
    const correctSolution = assignment.solution.answer.replace(/\s+/g, '').toLowerCase();

    // Check if the answer is correct
    const isCorrect = submittedAnswer === correctSolution;

    // Update assignment
    assignment.studentAnswer = answer;
    assignment.isCompleted = isCorrect;
    await assignment.save();

    res.json({
      isCorrect,
      message: isCorrect ? 'Correct answer! Well done!' : 'Incorrect answer. Try again!'
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Delete an assignment (teacher only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const teacherId = req.user.id;
    
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacher: teacherId
    });

    if (!assignment) {
      return res.status(404).json({ error: 'המטלה לא נמצאה' });
    }

    await assignment.deleteOne();
    res.json({ message: 'המטלה נמחקה בהצלחה' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'שגיאה במחיקת המטלה' });
  }
});

// Helper function to calculate solution for linear equations
const calculateSolution = (equation) => {
  try {
    // Split into two equations
    const equations = equation.split('\n');
    const [eq1, eq2] = equations.map(eq => {
      // Parse equation like "ax + by = c"
      const parts = eq.split('=').map(part => part.trim());
      const rightSide = parseFloat(parts[1]);
      const leftSide = parts[0].split('+').map(term => term.trim());
      
      const xTerm = leftSide.find(term => term.includes('x')) || '0x';
      const yTerm = leftSide.find(term => term.includes('y')) || '0y';
      
      const a = parseFloat(xTerm.replace('x', '')) || 0;
      const b = parseFloat(yTerm.replace('y', '')) || 0;
      
      return { a, b, c: rightSide };
    });

    // Calculate using Cramer's rule
    const det = (eq1.a * eq2.b) - (eq1.b * eq2.a);
    const detX = (eq1.c * eq2.b) - (eq1.b * eq2.c);
    const detY = (eq1.a * eq2.c) - (eq2.a * eq1.c);
    
    const x = detX / det;
    const y = detY / det;

    return {
      steps: [
        `נשתמש בשיטת קרמר לפתרוןן המערכת:`,
        `משוואה 1: ${eq1.a}x + ${eq1.b}y = ${eq1.c}`,
        `משוואה 2: ${eq2.a}x + ${eq2.b}y = ${eq2.c}`,
        `נחשב את הדטרמיננטה D = ${eq1.a}⋅${eq2.b} - ${eq2.a}⋅${eq1.b} = ${det}`,
        `נחשב את Dx = ${eq1.c}⋅${eq2.b} - ${eq2.b}⋅${eq2.c} = ${detX}`,
        `נחשב את Dy = ${eq1.a}⋅${eq2.c} - ${eq2.a}⋅${eq1.c} = ${detY}`,
        `x = Dx/D = ${x}`,
        `y = Dy/D = ${y}`
      ],
      answer: `x=${x}, y=${y}`,
      final_answers: {
        x: x.toString(),
        y: y.toString()
      }
    };
  } catch (error) {
    console.error('Error calculating solution:', error);
    return {
      steps: [],
      answer: '',
      final_answers: { x: '', y: '' }
    };
  }
};

// Get a single assignment
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;

    console.log('Fetching assignment:', assignmentId, 'for user:', userId);

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      $or: [
        { student: userId },
        { teacher: userId }
      ]
    });

    if (!assignment) {
      console.log('Assignment not found or not accessible');
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // If solution is missing, calculate it
    if (!assignment.solution?.answer && assignment.equation) {
      const solution = calculateSolution(assignment.equation);
      assignment.solution = solution;
      await assignment.save();
      console.log('Updated assignment with solution:', solution);
    }

    console.log('Found assignment:', assignment);
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

export { router as assignmentRoutes }; 