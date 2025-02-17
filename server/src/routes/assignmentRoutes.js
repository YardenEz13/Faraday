import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import { generateAssignmentWithAI } from '../services/mathGeneratorService.js';
import { generateMathQuestion } from '../services/mathGeneratorService.js';
import Class from '../models/Class.js';

const router = express.Router();

// Get assignments for a user (teacher or student)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, id } = req.user;
    let assignments;

    console.log('Fetching assignments for user:', id, 'with role:', role);

    if (role === 'teacher') {
      // Get all students for this teacher
      const classes = await Class.find({ teacherId: id });
      const studentIds = classes.reduce((acc, curr) => [...acc, ...curr.students], []);
      
      // Get all assignments for these students
      assignments = await Assignment.find({ 
        $or: [
          { teacherId: id },
          { student: { $in: studentIds } }
        ]
      })
      .populate('student', 'username email')
      .populate('classId', 'name')
      .sort('-createdAt');

      console.log('Found assignments for teacher:', assignments.length);
    } else {
      // For students, we need to search by the student field
      assignments = await Assignment.find({ student: id })
        .populate('teacherId', 'username email')
        .populate('classId', 'name')
        .sort('-createdAt');
    }

    // Transform assignments for client
    const transformedAssignments = assignments.map(assignment => ({
      ...assignment.toObject(),
      id: assignment._id,
      studentName: assignment.student?.username || 'N/A',
      teacherName: assignment.teacherId?.username || 'N/A',
      className: assignment.classId?.name || 'N/A',
      dueDate: assignment.dueDate,
      status: assignment.status,
      isLate: assignment.isLate || false,
      grade: assignment.grade || 0
    }));

    // Group assignments by status
    const result = {
      activeAssignments: transformedAssignments.filter(a => a.status === 'active' && !a.isLate),
      lateAssignments: transformedAssignments.filter(a => a.status === 'active' && a.isLate),
      submittedAssignments: transformedAssignments.filter(a => a.status === 'submitted' || a.status === 'graded'),
      stats: {
        totalAssignments: transformedAssignments.length,
        completedAssignments: transformedAssignments.filter(a => a.status === 'submitted' || a.status === 'graded').length,
        lateAssignments: transformedAssignments.filter(a => a.isLate).length,
        activeAssignments: transformedAssignments.filter(a => a.status === 'active' && !a.isLate).length
      }
    };

    console.log('Sending assignments:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('Error getting assignments:', error);
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
});

// Get a single assignment
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Fetching assignment:', assignmentId, 'for user:', userId, 'role:', userRole);

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      $or: [
        { student: userId },
        { teacherId: userId }
      ]
    })
    .populate('student', 'username email')
    .populate('teacherId', 'username email')
    .populate('classId', 'name');

    if (!assignment) {
      console.log('Assignment not found or not accessible');
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Transform assignment for client
    const transformedAssignment = {
      ...assignment.toObject(),
      id: assignment._id,
      studentName: assignment.student?.username || 'N/A',
      teacherName: assignment.teacherId?.username || 'N/A',
      className: assignment.classId?.name || 'N/A',
      dueDate: assignment.dueDate,
      status: assignment.status,
      isLate: assignment.isLate || false,
      grade: assignment.grade || 0
    };

    console.log('Sending assignment:', JSON.stringify(transformedAssignment, null, 2));
    res.json(transformedAssignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Failed to fetch assignment' });
  }
});

// Create a new assignment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, questions, topic, classId, dueDate, teacherId } = req.body;

    // Validate required fields
    if (!title || !questions || !topic || !dueDate || !classId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify that the teacher owns this class
    const classDoc = await Class.findOne({ _id: classId, teacherId });
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Create assignments for all students in the class
    const assignments = await Promise.all(classDoc.students.map(async (studentId) => {
      const assignment = new Assignment({
        title,
        questions,
        topic,
        teacherId,
        student: studentId,
        classId,
        dueDate: new Date(dueDate),
        status: 'active'
      });
      return assignment.save();
    }));

    res.status(201).json(assignments);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(69).json({ message: 'Failed to create assignment' });
  }
});

// Get current question for an assignment
router.get('/:id/question', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Fetching question for assignment:', assignmentId, 'for user:', userId, 'role:', userRole);

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      $or: [
        { student: userId },
        { teacherId: userId }
      ]
    });

    if (!assignment) {
      console.log('Assignment not found or not accessible');
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Get the current question based on currentQuestionIndex
    const currentQuestionIndex = assignment.currentQuestionIndex || 0;
    let currentQuestion = assignment.questions[currentQuestionIndex];

    // For adaptive assignments, generate a new question if needed
    if (assignment.isAdaptive && !currentQuestion) {
      // Generate new question based on student's current level
      currentQuestion = await generateMathQuestion(assignment.topic, assignment.studentLevel);
      
      // Add the question to the assignment
      assignment.questions.push(currentQuestion);
      await assignment.save();
    }
    
    if (!currentQuestion) {
      return res.status(404).json({ message: 'No questions found in this assignment' });
    }

    // If assignment is completed or user is teacher, return full question data including solution
    if (assignment.status === 'submitted' || assignment.status === 'graded' || userRole === 'teacher') {
      return res.json({
        question: currentQuestion,
        currentQuestionIndex,
        totalQuestions: assignment.questions.length,
        studentLevel: assignment.studentLevel || 1,
        isCompleted: assignment.status === 'submitted' || assignment.status === 'graded',
        studentAnswer: currentQuestion.studentAnswer
      });
    }

    // For active assignments, return question without solution
    const { solution, ...questionWithoutSolution } = currentQuestion;
    return res.json({
      question: questionWithoutSolution,
      currentQuestionIndex,
      totalQuestions: assignment.questions.length,
      studentLevel: assignment.studentLevel || 1,
      isCompleted: false,
      canSubmitEarly: assignment.canSubmitEarlyNow?.()
    });

  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

// Submit answer for an assignment
router.post('/:id/answer', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { answer } = req.body;
    const userId = req.user.id;

    console.log('Submitting answer:', { assignmentId, answer });

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      student: userId
    });

    if (!assignment) {
      console.log('Assignment not found for user:', userId);
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Get the current question
    const currentQuestionIndex = assignment.currentQuestionIndex || 0;
    const currentQuestion = assignment.questions[currentQuestionIndex];

    if (!currentQuestion) {
      console.log('Current question not found');
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!currentQuestion.solution) {
      console.log('No solution found for question:', currentQuestion);
      return res.status(400).json({ message: 'No solution found for this question' });
    }

    // Parse the solution if needed
    let parsedSolution = currentQuestion.solution;
    if (typeof parsedSolution === 'string') {
      try {
        parsedSolution = JSON.parse(currentQuestion.solution);
      } catch (error) {
        console.error('Error parsing solution:', error);
        return res.status(400).json({ message: 'Invalid solution format' });
      }
    }

    if (!parsedSolution?.final_answers) {
      console.log('No final answers in solution:', parsedSolution);
      return res.status(400).json({ message: 'No solution found for this question' });
    }

    const isCorrect = checkAnswer(answer, parsedSolution.final_answers);

    console.log('Answer check result:', { 
      userAnswer: answer,
      correctAnswer: parsedSolution.final_answers,
      isCorrect 
    });

    // Update the question with the student's answer and correctness
    assignment.questions[currentQuestionIndex].studentAnswer = answer;
    assignment.questions[currentQuestionIndex].isCorrect = isCorrect;

    // If answer is correct, update progress
    if (isCorrect) {
      assignment.correctAnswers += 1;
      assignment.currentQuestionIndex += 1;

      // Update student's topic level if adaptive
      if (assignment.isAdaptive) {
        const student = await User.findById(userId);
        const successRate = assignment.correctAnswers / (currentQuestionIndex + 1);
        
        // More dynamic level adjustment based on performance
        if (!student.topicLevels) student.topicLevels = {};
        
        let currentLevel = student.topicLevels[assignment.topic] || 1;
        
        if (isCorrect) {
          // Increase level more aggressively for consistent correct answers
          if (successRate >= 0.8) {
            currentLevel = Math.min(5, currentLevel + 0.5);
          } else if (successRate >= 0.6) {
            currentLevel = Math.min(5, currentLevel + 0.25);
          }
        } else {
          // Decrease level if struggling
          if (successRate < 0.5) {
            currentLevel = Math.max(1, currentLevel - 0.25);
          }
        }
        
        student.topicLevels[assignment.topic] = currentLevel;
        assignment.studentLevel = currentLevel;
        
        await student.save();
        
        // Generate next question based on new level if needed
        if (assignment.currentQuestionIndex >= assignment.questions.length) {
          const nextQuestion = await generateMathQuestion(assignment.topic, currentLevel);
          assignment.questions.push(nextQuestion);
        }
      }

      // Check if assignment can be completed
      const canComplete = assignment.currentQuestionIndex >= assignment.minQuestionsRequired && 
                         (assignment.correctAnswers / assignment.currentQuestionIndex) >= 0.7;

      if (canComplete) {
        assignment.status = 'submitted';
        assignment.submittedAt = new Date();
        assignment.isCompleted = true;
        assignment.grade = Math.round((assignment.correctAnswers / assignment.currentQuestionIndex) * 100);
      }
    }

    await assignment.save();

    // Prepare response
    const response = {
      isCorrect,
      isCompleted: assignment.isCompleted,
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer, try again',
      solution: isCorrect ? parsedSolution : null,
      canSubmitEarly: !assignment.isCompleted && 
                     assignment.currentQuestionIndex >= assignment.minQuestionsRequired && 
                     (assignment.correctAnswers / assignment.currentQuestionIndex) >= 0.7,
      progress: {
        currentQuestion: currentQuestionIndex + 1,
        totalQuestions: Math.max(assignment.minQuestionsRequired, assignment.questions.length),
        correctAnswers: assignment.correctAnswers,
        grade: Math.round((assignment.correctAnswers / assignment.currentQuestionIndex) * 100)
      }
    };

    // Add next question if available and not completed
    if (!assignment.isCompleted && assignment.questions[assignment.currentQuestionIndex]) {
      const nextQuestion = assignment.questions[assignment.currentQuestionIndex];
      response.nextQuestion = {
        title: nextQuestion.title,
        description: nextQuestion.description,
        equation: nextQuestion.equation,
        hints: nextQuestion.hints
      };
    }

    res.json(response);

  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Failed to submit answer' });
  }
});

// Create a new assignment
router.post("/create", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can create assignments" });
    }

    const { title, topic, studentId, dueDate } = req.body;
    
    // Validate required fields
    if (!title || !topic || !studentId || !dueDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get student's current level for this topic
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create the assignment with consistent field names
    const assignment = new Assignment({
      title,
      topic,
      teacherId: req.user.id,  // Using teacherId to match schema
      student: studentId,
      questions: req.body.questions,
      dueDate: new Date(dueDate),
      isCompleted: req.body.isCompleted || false,
      currentQuestionIndex: req.body.currentQuestionIndex || 0,
      correctAnswers: req.body.correctAnswers || 0,
      isAdaptive: req.body.isAdaptive || false,
      grade: req.body.grade || 0,
      status: 'active'
    });

    const savedAssignment = await assignment.save();
    console.log('Created assignment:', savedAssignment); // Add logging
    res.json(savedAssignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ message: "Failed to create assignment" });
  }
});

// Get assignment question
router.get("/:assignmentId/question", authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if user is authorized
    if (assignment.student.toString() !== req.user.id && 
        assignment.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this assignment" });
    }

    // If assignment is completed, return all questions with solutions
    if (assignment.status === 'submitted' || assignment.status === 'graded') {
      return res.json({
        isCompleted: true,
        questions: assignment.questions,
        studentLevel: assignment.studentLevel
      });
    }

    // Return current question without solution
    const currentQuestion = assignment.questions[assignment.currentQuestionIndex];
    const { solution, ...questionWithoutSolution } = currentQuestion;

    res.json({
      currentQuestionIndex: assignment.currentQuestionIndex,
      totalQuestions: assignment.questions.length,
      question: questionWithoutSolution,
      studentLevel: assignment.studentLevel
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ message: "Failed to fetch question" });
  }
});

// Submit completed assignment
router.post("/:assignmentId/submit", authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (assignment.status !== 'active') {
      return res.status(400).json({ message: "Assignment is already submitted" });
    }

    // Calculate grade based on correct answers
    const correctAnswers = assignment.questions.filter(q => q.isCorrect).length;
    const grade = Math.round((correctAnswers / assignment.questions.length) * 100);

    // Update assignment status and grade
    assignment.status = 'submitted';
    assignment.grade = grade;
    assignment.submittedAt = new Date();

    // Check if assignment is late
    if (assignment.dueDate && new Date() > assignment.dueDate) {
      assignment.isLate = true;
    }

    // Update student's topic level in user profile
    const student = await User.findById(assignment.student);
    if (!student.topicLevels) {
      student.topicLevels = {};
    }
    student.topicLevels[assignment.topic] = assignment.studentLevel;
    await student.save();

    await assignment.save();

    res.json({
      message: "Assignment submitted successfully",
      grade,
      isLate: assignment.isLate,
      finalLevel: assignment.studentLevel
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({ message: "Failed to submit assignment" });
  }
});

// Delete an assignment
router.delete("/:assignmentId", authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if user is authorized (must be the teacher who created the assignment)
    if (assignment.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this assignment" });
    }

    await Assignment.findByIdAndDelete(req.params.assignmentId);
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Failed to delete assignment" });
  }
});

// Get hint for current question
router.get("/:assignmentId/hint", authMiddleware, async (req, res) => {
  try {
    console.log('Getting hint for assignment:', req.params.assignmentId);
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      console.log('Assignment not found');
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.student.toString() !== req.user.id) {
      console.log('Unauthorized access');
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get the current question and its hints
    let currentQuestion, hints;
    
    if (assignment.questions && assignment.questions.length > 0) {
      currentQuestion = assignment.questions[assignment.currentQuestionIndex || 0];
      hints = currentQuestion.hints;
    } else {
      // For legacy assignments, get hints directly from the assignment
      currentQuestion = assignment;
      hints = assignment.hints;
    }

    // Log the raw hints from assignment
    console.log('Raw hints from assignment:', assignment.hints);
    console.log('Current question:', currentQuestion);
    console.log('Available hints:', hints);

    if (!Array.isArray(hints) || hints.length === 0) {
      console.log('No hints available');
      return res.status(404).json({ message: "No hints available for this question" });
    }

    // Get next unused hint
    const usedHints = assignment.usedHints || [];
    const nextHintIndex = Math.min(usedHints.length, hints.length - 1);
    const currentHint = hints[nextHintIndex];

    console.log('Sending hint:', {
      hintIndex: nextHintIndex,
      totalHints: hints.length,
      hint: currentHint
    });

    // Mark hint as used
    if (!assignment.usedHints) {
      assignment.usedHints = [];
    }
    if (!assignment.usedHints.includes(nextHintIndex)) {
      assignment.usedHints.push(nextHintIndex);
      await assignment.save();
    }

    // Return response in the format expected by the frontend
    res.json({
      data: {
        hint: currentHint,
        hintNumber: nextHintIndex + 1,
        totalHints: hints.length,
        hasMoreHints: nextHintIndex < hints.length - 1
      }
    });

  } catch (error) {
    console.error("Error getting hint:", error);
    res.status(500).json({ message: "Failed to get hint" });
  }
});

// Get hint for an assignment
router.get('/:id/hint', authMiddleware, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;

    console.log('Getting hint for assignment:', assignmentId);

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      student: userId
    });
    
    if (!assignment) {
      console.log('Assignment not found');
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Get hints from the assignment (handles both single-question and multi-question formats)
    const hints = assignment.hints || 
                 (assignment.questions && assignment.questions[assignment.currentQuestionIndex]?.hints) || 
                 [];
    
    console.log('Available hints:', hints);
    
    if (!hints || hints.length === 0) {
      console.log('No hints available');
      return res.status(404).json({ message: 'No hints available for this question' });
    }

    // Get next unused hint
    const usedHints = assignment.usedHints || 0;
    if (usedHints >= hints.length) {
      console.log('All hints used');
      return res.status(404).json({ message: 'All hints have been used' });
    }

    // Update used hints count
    await Assignment.findByIdAndUpdate(assignmentId, {
      $set: {
        usedHints: usedHints + 1
      }
    });

    // Return response in the format expected by the frontend
    const response = {
      data: {
        hint: hints[usedHints],
        hintNumber: usedHints + 1,
        totalHints: hints.length,
        hasMoreHints: usedHints < hints.length - 1
      }
    };

    console.log('Sending hint response:', response);
    return res.json(response);

  } catch (error) {
    console.error('Error getting hint:', error);
    return res.status(500).json({ message: 'Error getting hint' });
  }
});

// Helper function to check answers
const checkAnswer = (userAnswer, correctAnswer) => {
  try {
    console.log('Checking answer:', { userAnswer, correctAnswer });
    
    // For probability questions, handle single number answers
    if (correctAnswer.x && !correctAnswer.y) {
      // Normalize the user answer by removing extra spaces and converting to number
      const userNum = parseFloat(userAnswer.replace(/\s+/g, ''));
      const correctNum = parseFloat(correctAnswer.x);
      
      if (isNaN(userNum) || isNaN(correctNum)) {
        console.log('Invalid number conversion:', { userNum, correctNum });
        return false;
      }
      
      const tolerance = 0.01;
      const isCorrect = Math.abs(userNum - correctNum) <= tolerance;
      
      console.log('Probability comparison:', {
        userNum,
        correctNum,
        tolerance,
        isCorrect
      });
      
      return isCorrect;
    }
    
    // For equations with x and y values
    const normalizedUserAnswer = userAnswer.replace(/\s+/g, '').toLowerCase();
    const userMatch = normalizedUserAnswer.match(/x=([^,\s]+)[,\s]*y=([^,\s]+)/i);
    
    if (!userMatch) {
      console.log('Invalid answer format:', normalizedUserAnswer);
      return false;
    }
    
    const [, userX, userY] = userMatch;
    const userXNum = parseFloat(userX);
    const userYNum = parseFloat(userY);
    const correctX = parseFloat(correctAnswer.x);
    const correctY = parseFloat(correctAnswer.y);
    
    if (isNaN(userXNum) || isNaN(userYNum) || isNaN(correctX) || isNaN(correctY)) {
      console.log('Invalid number conversion:', {
        userX, userY, correctX, correctY
      });
      return false;
    }
    
    const tolerance = 0.01;
    const isXCorrect = Math.abs(userXNum - correctX) <= tolerance;
    const isYCorrect = Math.abs(userYNum - correctY) <= tolerance;
    
    console.log('Equation comparison:', {
      userX: userXNum,
      userY: userYNum,
      correctX,
      correctY,
      isXCorrect,
      isYCorrect,
      tolerance
    });
    
    return isXCorrect && isYCorrect;
  } catch (error) {
    console.error('Error checking answer:', error);
    return false;
  }
};

// Create an adaptive assignment
router.post('/adaptive', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create assignments' });
    }

    const { title, topic, classId, dueDate, teacherId } = req.body;

    // Validate required fields
    if (!title || !topic || !dueDate || !classId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify that the teacher owns this class
    const classDoc = await Class.findOne({ _id: classId, teacherId });
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Create assignments for all students in the class
    const assignments = await Promise.all(classDoc.students.map(async (studentId) => {
      // Get student's current level for this topic
      const student = await User.findById(studentId);
      const studentLevel = student.topicLevels?.[topic] || 1;

      // Generate initial question based on student's level
      const initialQuestion = await generateMathQuestion(topic, studentLevel);

      const assignment = new Assignment({
        title,
        topic,
        teacherId,
        student: studentId,
        classId,
        dueDate: new Date(dueDate),
        status: 'active',
        isAdaptive: true,
        studentLevel,
        minQuestionsRequired: 5,
        questions: [initialQuestion],
        currentQuestionIndex: 0,
        correctAnswers: 0
      });

      return assignment.save();
    }));

    res.status(201).json(assignments);
  } catch (error) {
    console.error('Error creating adaptive assignment:', error);
    res.status(500).json({ message: 'Failed to create adaptive assignment' });
  }
});

export { router as assignmentRoutes }; 