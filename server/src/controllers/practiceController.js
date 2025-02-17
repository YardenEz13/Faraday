import { QuestionService } from '../services/questionService.js';
import User from '../models/User.js';
import { QUESTIONS_BANK } from '../data/questionsBank.js';
import Assignment from '../models/Assignment.js';

// Utility functions for generating questions
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateNiceCoefficients = (difficulty) => {
  const baseRange = difficulty * 2;
  const a = getRandomInt(-baseRange, baseRange);
  const b = getRandomInt(-baseRange, baseRange);
  return { a, b };
};

// Function to get a question based on topic and difficulty
const generateQuestionForTopic = (topic, difficulty) => {
  if (!QUESTIONS_BANK[topic]) {
    throw new Error("נושא לא תקין");
  }

  // Find questions at or below the requested difficulty
  const availableQuestions = QUESTIONS_BANK[topic].filter(q => q.difficulty <= difficulty);
  
  if (availableQuestions.length === 0) {
    throw new Error("לא נמצאו שאלות ברמת הקושי המבוקשת");
  }

  // Select a random question from the available ones
  const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  
  // Generate the question with random parameters
  const question = selectedQuestion.generator();
  
  // Ensure _questionData is set for all questions
  question._questionData = {
    topic,
    difficulty: selectedQuestion.difficulty,
    solution: question.solution
  };
  
  return question;
};

// Main controller functions
export const getPracticeQuestion = async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the user's current level for this topic
    const currentLevel = user.topicLevels?.[topic] || 1;
    
    // Clear the previous question before generating a new one
    user.currentQuestion = null;
    await user.save();
    
    // Generate a new question based on the user's level
    const question = await QuestionService.generateQuestion(topic, currentLevel);
    
    // Store the current question for later verification
    user.currentQuestion = {
      ...question,
      timestamp: new Date()
    };
    
    // Mark the currentQuestion field as modified
    user.markModified('currentQuestion');
    await user.save();

    // Remove solution from response
    const { solution, ...questionWithoutSolution } = question;
    
    console.log('Generated new question for topic:', topic, 'at level:', currentLevel);
    
    res.json({
      ...questionWithoutSolution,
      currentLevel
    });
  } catch (error) {
    console.error('Error getting practice question:', error);
    res.status(500).json({ error: 'Error generating question' });
  }
};

export const submitPracticeAnswer = async (req, res) => {
  try {
    const { topic } = req.params;
    const { answer } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.currentQuestion) {
      return res.status(400).json({ error: 'No active question' });
    }

    // Parse the user answer first
    const parsedUserAnswer = parseUserAnswer(answer);
    console.log('Parsed user answer:', parsedUserAnswer);

    // Use QuestionService to check the answer
    const isCorrect = QuestionService.checkAnswer(
      parsedUserAnswer,
      user.currentQuestion.solution.final_answers
    );

    console.log('Answer check result:', isCorrect);

    // Calculate new level using the shared logic
    const currentLevel = user.topicLevels?.[topic] || 1;
    const { newLevel, levelChange, consecutiveCorrect, consecutiveWrong } = QuestionService.calculateNewLevel(
      currentLevel,
      isCorrect,
      isCorrect ? user.consecutiveCorrect : 0,
      !isCorrect ? user.consecutiveIncorrect : 0
    );

    // Update user's topic level
    if (!user.topicLevels) user.topicLevels = {};
    user.topicLevels[topic] = newLevel;
    
    // Update consecutive counters
    user.consecutiveCorrect = consecutiveCorrect;
    user.consecutiveIncorrect = consecutiveWrong;

    // Update overall math level
    const topicLevels = Object.values(user.topicLevels)
      .filter(level => typeof level === 'number' && !isNaN(level));
    
    if (topicLevels.length > 0) {
      user.mathLevel = parseFloat((topicLevels.reduce((a, b) => a + b, 0) / topicLevels.length).toFixed(2));
    }

    // Save changes
    await user.save();

    res.json({
      isCorrect,
      newLevel,
      levelChange,
      mathLevel: user.mathLevel,
      message: `Level ${levelChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(levelChange)}`
    });

  } catch (error) {
    console.error('Error submitting practice answer:', error);
    res.status(500).json({ error: 'Error processing answer' });
  }
};

export const getTopicLevel = async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const topicLevel = user.getTopicLevel(topic);
    return res.json({
      topicLevel,
      mathLevel: user.mathLevel,
      topicLevels: user.getAllTopicLevels()
    });
  } catch (error) {
    console.error('Error getting topic level:', error);
    return res.status(500).json({ error: 'Failed to get topic level' });
  }
};

// Helper functions for answer checking
const parseUserAnswer = (answer) => {
  try {
    // Clean the input string and convert to lowercase
    const cleanAnswer = answer.toString().toLowerCase().trim();
    
    // For simple decimal number (like 8)
    if (!isNaN(cleanAnswer) && !cleanAnswer.includes('=')) {
      const value = parseFloat(cleanAnswer);
      return { x: value };
    }
    
    // For x=value format
    if (cleanAnswer.includes('=')) {
      const parts = cleanAnswer.split(/[,\s]+/).filter(Boolean);
      const result = {};
      
      parts.forEach(part => {
        if (part.includes('=')) {
          const [variable, value] = part.split('=').map(s => s.trim());
          if (variable && value) {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
              result[variable.toLowerCase()] = parsedValue;
            }
          }
        }
      });
      
      // If we have x but no y, that's fine for sequence questions
      if (result.x && !result.y) {
        return { x: result.x };
      }
      
      return result;
    }
    
    // For comma-separated values
    const parts = cleanAnswer.split(/[,\s]+/).filter(Boolean).map(part => parseFloat(part.trim()));
    if (parts.length === 1 && !isNaN(parts[0])) {
      return { x: parts[0] };
    }
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { x: parts[0], y: parts[1] };
    }
    
    throw new Error('Invalid answer format');
  } catch (error) {
    console.error('Error parsing answer:', error);
    throw new Error('Invalid answer format');
  }
}; 