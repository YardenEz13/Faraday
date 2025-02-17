// server/src/controllers/assignmentController.js
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import { QUESTIONS_BANK } from '../data/questionsBank.js';
import Class from "../models/Class.js";
import { generateQuestions } from '../services/questionGenerator.js';
import { QuestionService } from '../services/questionService.js';

// Helper function to generate questions based on student level
const generateQuestionsForLevel = (topic, level, count = 5) => {
  if (!QUESTIONS_BANK[topic]) {
    throw new Error("נושא לא תקין");
  }

  const questions = [];
  const availableQuestions = QUESTIONS_BANK[topic].filter(q => 
    Math.abs(q.difficulty - level) <= 1 // Get questions within 1 level of student's level
  );

  if (availableQuestions.length === 0) {
    throw new Error("לא נמצאו שאלות מתאימות לרמה זו");
  }

  // Generate specified number of questions
  for (let i = 0; i < count; i++) {
    const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    const question = selectedQuestion.generator();
    questions.push({
      ...question,
      difficulty: selectedQuestion.difficulty,
      _questionData: {
        topic,
        difficulty: selectedQuestion.difficulty,
        solution: question.solution
      }
    });
  }

  return questions;
};

export const createAssignment = async (req, res) => {
  try {
    const { topic, title, dueDate, studentId, classId, isAdaptive = true } = req.body;
    const { userId: teacherId } = req;

    // Get student's current level
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentLevel = student.topicLevels?.[topic] || 1;
    
    // Generate questions based on student's level
    const questions = await QuestionService.generateQuestionsForLevel(topic, studentLevel);

    const assignment = new Assignment({
      title,
      topic,
      teacherId,
      student: studentId,
      classId,
      questions,
      dueDate,
      isAdaptive,
      studentLevel,
      status: 'active'
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Error creating assignment' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { role, id } = req.user;
    let assignments;

    // Get the current user's mathLevel
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (role === 'teacher') {
      assignments = await Assignment.find({ teacher: id })
        .populate('student', 'username email mathLevel')
        .sort('-createdAt');
    } else {
      // For students, update studentLevel to match current mathLevel
      await Assignment.updateMany(
        { 
          student: id,
          status: { $in: ['active', 'submitted'] }
        },
        { 
          $set: { studentLevel: user.mathLevel }
        }
      );

      assignments = await Assignment.find({ student: id })
        .populate('teacher', 'username email')
        .sort('-createdAt');
    }

    res.json(assignments);
  } catch (error) {
    console.error('Error getting assignments:', error);
    res.status(500).json({ error: 'Failed to get assignments' });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { answer } = req.body;
    const assignmentId = req.params.id;
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

    // Update assignment
    assignment.studentAnswer = answer;
    assignment.isCompleted = true;
    assignment.studentLevel = req.user.mathLevel;
    assignment.status = 'submitted';
    assignment.submittedAt = new Date();
    await assignment.save();

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
};

export const createAdaptiveAssignment = async (req, res) => {
  try {
    const { title, topic, studentId, classId, dueDate } = req.body;
    const teacherId = req.user.id;

    // Validate that either studentId or classId is provided
    if (!studentId && !classId) {
      return res.status(400).json({ error: 'נדרש לציין תלמיד או כיתה' });
    }

    // Handle individual student assignment
    if (studentId) {
      const student = await User.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'תלמיד לא נמצא' });
      }

      const studentLevel = student.getTopicLevel(topic);
      console.log(`Generating questions for student ${student.username} at level ${studentLevel} in topic ${topic}`);

      const questions = generateQuestionsForLevel(topic, studentLevel);

      const assignment = new Assignment({
        title,
        topic,
        teacherId,
        student: studentId,
        dueDate: dueDate || undefined,
        questions: questions.map(q => ({
          title: q.title,
          description: q.description,
          equation: q.equation,
          hints: q.hints,
          difficulty: q.difficulty,
          solution: q.solution,
          _questionData: q._questionData
        })),
        currentQuestionIndex: 0,
        isAdaptive: true,
        studentLevel: student.mathLevel,
        status: 'active'
      });

      await assignment.save();
      console.log(`Created adaptive assignment for student ${student.username}`);

      return res.status(201).json({
        message: 'שיעורי הבית נוצרו בהצלחה',
        assignment: {
          id: assignment._id,
          title,
          topic,
          questionCount: questions.length
        }
      });
    }

    // Handle class assignment
    const classDoc = await Class.findById(classId).populate('students');
    if (!classDoc) {
      return res.status(404).json({ error: 'כיתה לא נמצאה' });
    }

    // Create base assignment for the class
    const classAssignment = new Assignment({
      title,
      topic,
      teacherId,
      classId,
      dueDate: dueDate || undefined,
      isAdaptive: true,
      studentAssignments: [],
      studentLevel: classDoc.students[0].mathLevel,
      status: 'active'
    });

    // Generate individual assignments for each student
    for (const student of classDoc.students) {
      const studentLevel = student.getTopicLevel(topic);
      console.log(`Generating questions for student ${student.username} at level ${studentLevel} in topic ${topic}`);

      const questions = generateQuestionsForLevel(topic, studentLevel);
      
      classAssignment.studentAssignments.push({
        student: student._id,
        questions: questions.map(q => ({
          title: q.title,
          description: q.description,
          equation: q.equation,
          hints: q.hints,
          difficulty: q.difficulty,
          solution: q.solution,
          _questionData: q._questionData
        })),
        currentQuestionIndex: 0,
        studentLevel: student.mathLevel
      });
    }

    await classAssignment.save();
    console.log(`Created adaptive assignment for class with ${classDoc.students.length} students`);

    return res.status(201).json({
      message: 'שיעורי הבית נוצרו בהצלחה לכל תלמידי הכיתה',
      assignment: {
        id: classAssignment._id,
        title,
        topic,
        studentCount: classDoc.students.length
      }
    });
  } catch (error) {
    console.error('Error creating adaptive assignment:', error);
    res.status(500).json({ 
      error: 'שגיאה ביצירת שיעורי בית',
      details: error.message 
    });
  }
};

export const submitAssignmentAnswer = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answer } = req.body;
    const student = await User.findById(req.user.id);
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment || !student) {
      return res.status(404).json({ error: 'Assignment or student not found' });
    }

    const currentQuestion = assignment.questions[assignment.currentQuestionIndex];
    const isCorrect = checkAnswer(answer, currentQuestion.solution);

    // Update assignment stats
    if (isCorrect) {
      assignment.correctAnswers += 1;
    }

    // Calculate new level using the same logic as practice
    const currentLevel = student.topicLevels?.[assignment.topic] || 1;
    const { newLevel, levelChange } = QuestionService.calculateNewLevel(
      currentLevel,
      isCorrect,
      isCorrect ? student.consecutiveCorrect : 0,
      !isCorrect ? student.consecutiveIncorrect : 0
    );

    // Update student's topic level
    if (!student.topicLevels) student.topicLevels = {};
    student.topicLevels[assignment.topic] = newLevel;
    
    // Update consecutive counters
    if (isCorrect) {
      student.consecutiveCorrect = (student.consecutiveCorrect || 0) + 1;
      student.consecutiveIncorrect = 0;
    } else {
      student.consecutiveIncorrect = (student.consecutiveIncorrect || 0) + 1;
      student.consecutiveCorrect = 0;
    }

    // Update overall math level
    const topicLevels = Object.values(student.topicLevels);
    if (topicLevels.length > 0) {
      student.mathLevel = parseFloat((topicLevels.reduce((a, b) => a + b, 0) / topicLevels.length).toFixed(2));
    }

    // Save changes
    await student.save();
    assignment.studentLevel = newLevel;
    await assignment.save();

    res.json({
      isCorrect,
      newLevel,
      levelChange,
      mathLevel: student.mathLevel,
      message: `Level ${levelChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(levelChange)}`
    });

  } catch (error) {
    console.error('Error submitting assignment answer:', error);
    res.status(500).json({ error: 'Error processing answer' });
  }
};

// Helper function for checking answers (same as practice)
const checkAnswer = (userAnswer, correctAnswer) => {
  const tolerance = 0.01;
  
  try {
    console.log('Checking answer:', { userAnswer, correctAnswer, tolerance });

    const normalizedUserAnswer = Object.fromEntries(
      Object.entries(userAnswer).map(([k, v]) => [k.toLowerCase(), parseFloat(v)])
    );
    const normalizedCorrectAnswer = Object.fromEntries(
      Object.entries(correctAnswer).map(([k, v]) => [k.toLowerCase(), parseFloat(v)])
    );

    if ('probability' in normalizedCorrectAnswer || 'x' in normalizedCorrectAnswer) {
      const correctValue = normalizedCorrectAnswer.probability || normalizedCorrectAnswer.x;
      const userValue = normalizedUserAnswer.probability || normalizedUserAnswer.x;
      
      // Convert both values to numbers with 3 decimal places
      const roundedCorrect = Math.round(correctValue * 1000) / 1000;
      const roundedUser = Math.round(userValue * 1000) / 1000;

      console.log('Probability comparison:', {
        correctValue,
        userValue,
        roundedCorrect,
        roundedUser,
        tolerance
      });

      return Math.abs(roundedCorrect - roundedUser) <= tolerance;
    }

    const results = Object.entries(normalizedCorrectAnswer).map(([key, value]) => {
      const userValue = normalizedUserAnswer[key];
      const exactMatch = Math.abs(value - userValue) <= tolerance;
      const roundedCorrectMatch = Math.abs(Math.round(value) - userValue) <= tolerance;
      const roundedUserMatch = Math.abs(value - Math.round(userValue)) <= tolerance;

      return exactMatch || roundedCorrectMatch || roundedUserMatch;
    });

    return results.every(r => r);
  } catch (error) {
    console.error('Error checking answer:', error);
    return false;
  }
};
