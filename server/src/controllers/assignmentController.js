// server/src/controllers/assignmentController.js
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import { QUESTIONS_BANK } from '../data/questionsBank.js';
import Class from "../models/Class.js";
import { generateQuestions } from '../services/questionGenerator.js';

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
    const teacherId = req.user.id;
    const { title, topic, classId, dueDate } = req.body;

    // Validate required fields
    if (!title || !topic || !classId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the class and verify it belongs to the teacher
    const classDoc = await Class.findOne({ _id: classId, teacherId });
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found or unauthorized' });
    }

    // Get all students in the class
    const students = await User.find({ 
      _id: { $in: classDoc.students },
      role: 'student'
    });

    if (students.length === 0) {
      return res.status(400).json({ error: 'No students found in this class' });
    }

    // Create assignments for all students in the class
    const assignments = await Promise.all(students.map(async (student) => {
      const questions = await generateQuestions(topic, student.mathLevel || 1);
      
      return new Assignment({
        title,
        topic,
        teacherId,
        student: student._id,
        classId,
        questions,
        dueDate: dueDate || undefined,
        status: 'active',
        isLate: false
      });
    }));

    // Save all assignments
    await Assignment.insertMany(assignments);

    return res.status(201).json({ 
      message: `Created ${assignments.length} assignments successfully`,
      count: assignments.length
    });
  } catch (error) {
    console.error('Error creating assignments:', error);
    return res.status(500).json({ error: 'Failed to create assignments' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { role, id } = req.user;
    let assignments;

    if (role === 'teacher') {
      assignments = await Assignment.find({ teacher: id })
        .populate('student', 'username email')
        .sort('-createdAt');
    } else {
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
        isAdaptive: true
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
      studentAssignments: []
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
        currentQuestionIndex: 0
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
    const userId = req.user.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'שיעורי בית לא נמצאו' });
    }

    // Handle individual assignment
    if (assignment.student?.toString() === userId) {
      const currentQuestion = assignment.questions[assignment.currentQuestionIndex];
      if (!currentQuestion) {
        return res.status(400).json({ error: 'לא נמצאה שאלה נוכחית' });
      }

      const isCorrect = checkAnswer(answer, currentQuestion.solution.final_answers);

      if (isCorrect) {
        assignment.currentQuestionIndex += 1;
        assignment.correctAnswers = (assignment.correctAnswers || 0) + 1;
        
        if (assignment.currentQuestionIndex >= assignment.questions.length) {
          assignment.isCompleted = true;
          assignment.completedAt = new Date();
        }
      }

      await assignment.save();

      // Update student's topic level if completed
      if (assignment.isCompleted) {
        const student = await User.findById(userId);
        const successRate = assignment.correctAnswers / assignment.questions.length;
        await student.updateTopicLevel(assignment.topic, successRate >= 0.7);
      }

      return res.json({
        success: isCorrect,
        isCompleted: assignment.isCompleted,
        nextQuestion: !assignment.isCompleted ? {
          index: assignment.currentQuestionIndex,
          total: assignment.questions.length,
          ...assignment.questions[assignment.currentQuestionIndex]
        } : null,
        solution: !isCorrect ? currentQuestion.solution : null
      });
    }

    // Handle class assignment
    const studentAssignment = assignment.studentAssignments?.find(
      sa => sa.student.toString() === userId
    );

    if (!studentAssignment) {
      return res.status(404).json({ error: 'לא נמצאו שיעורי בית עבור התלמיד' });
    }

    const currentQuestion = studentAssignment.questions[studentAssignment.currentQuestionIndex];
    if (!currentQuestion) {
      return res.status(400).json({ error: 'לא נמצאה שאלה נוכחית' });
    }

    const isCorrect = checkAnswer(answer, currentQuestion.solution.final_answers);

    if (isCorrect) {
      studentAssignment.currentQuestionIndex += 1;
      studentAssignment.correctAnswers = (studentAssignment.correctAnswers || 0) + 1;
      
      if (studentAssignment.currentQuestionIndex >= studentAssignment.questions.length) {
        studentAssignment.isCompleted = true;
        studentAssignment.completedAt = new Date();
      }
    }

    await assignment.save();

    // Update student's topic level if completed
    if (studentAssignment.isCompleted) {
      const student = await User.findById(userId);
      const successRate = studentAssignment.correctAnswers / studentAssignment.questions.length;
      await student.updateTopicLevel(assignment.topic, successRate >= 0.7);
    }

    return res.json({
      success: isCorrect,
      isCompleted: studentAssignment.isCompleted,
      nextQuestion: !studentAssignment.isCompleted ? {
        index: studentAssignment.currentQuestionIndex,
        total: studentAssignment.questions.length,
        ...studentAssignment.questions[studentAssignment.currentQuestionIndex]
      } : null,
      solution: !isCorrect ? currentQuestion.solution : null
    });
  } catch (error) {
    console.error('Error submitting assignment answer:', error);
    return res.status(500).json({ error: 'שגיאה בשליחת התשובה' });
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
      
      const roundedCorrect = Math.round(correctValue * 1000) / 1000;
      const roundedUser = Math.round(userValue * 1000) / 1000;

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
