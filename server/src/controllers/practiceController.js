import User from '../models/User.js';
import { QUESTIONS_BANK } from '../data/questionsBank.js';

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

    // Get user's current level for this topic
    const user = await User.findById(userId);
    const currentLevel = user.mathLevel || 1;

    // Generate a question based on topic and difficulty
    const question = generateQuestionForTopic(topic, currentLevel);
    
    // Store the question data in the user document
    user.currentQuestion = {
      topic,  // Store the topic directly
      data: question._questionData,
      solution: question.solution,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9), // Add a unique ID
      question: {
        title: question.title,
        description: question.description,
        equation: question.equation,
        hints: question.hints
      }
    };
    await user.markModified('currentQuestion');
    await user.save();

    // Return question without solution
    res.json({
      id: user.currentQuestion.id,
      title: question.title,
      description: question.description,
      equation: question.equation,
      hints: question.hints
    });
  } catch (error) {
    console.error('Error getting practice question:', error);
    res.status(500).json({ 
      error: 'שגיאה בקבלת שאלת תרגול',
      details: error.message 
    });
  }
};

export const submitPracticeAnswer = async (req, res) => {
  try {
    const { topic, answer } = req.body;
    const userId = req.user.id;

    // Validate topic
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Invalid topic parameter' });
    }

    // Validate that topic exists in QUESTIONS_BANK
    if (!QUESTIONS_BANK[topic]) {
      return res.status(400).json({ error: 'Invalid topic' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse and validate the user's answer
    let parsedUserAnswer;
    try {
      parsedUserAnswer = parseUserAnswer(answer);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid answer format' });
    }

    // Get the current question's solution from user document
    if (!user.currentQuestion || !user.currentQuestion.solution || !user.currentQuestion.solution.final_answers) {
      return res.status(400).json({ error: 'No active question found' });
    }

    // Check if the answer is correct
    const isCorrect = checkAnswer(parsedUserAnswer, user.currentQuestion.solution.final_answers);

    // Update the topic level and math level
    const newTopicLevel = await user.updateTopicLevel(topic, isCorrect);

    return res.json({
      success: isCorrect,
      newTopicLevel,
      mathLevel: user.mathLevel,
      topicLevels: Array.from(user.topicLevels.entries()).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {}),
      // Include solution when answer is incorrect
      ...(isCorrect ? {} : {
        solution: {
          steps: user.currentQuestion.solution.steps,
          final_answers: user.currentQuestion.solution.final_answers
        }
      })
    });
  } catch (error) {
    console.error('Error submitting practice answer:', error);
    return res.status(500).json({ error: 'Failed to submit practice answer', details: error.message });
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
    
    // For probability questions (single decimal number)
    if (!cleanAnswer.includes('=') && !cleanAnswer.includes(',')) {
      let value = parseFloat(cleanAnswer);
      
      // If the answer is a percentage (e.g., 33%), convert to decimal
      if (cleanAnswer.includes('%')) {
        value = value / 100;
      }
      
      // Round to 3 decimal places for probability
      value = Math.round(value * 1000) / 1000;
      
      if (!isNaN(value)) {
        return { probability: value };
      }
    }
    
    // For probability=value format
    if (cleanAnswer.includes('probability=')) {
      const value = parseFloat(cleanAnswer.split('=')[1]);
      return { probability: Math.round(value * 1000) / 1000 };
    }
    
    // For x=value, y=value format or x=value y=value format
    if (cleanAnswer.includes('=')) {
      // Split by comma or space and filter out empty strings
      const parts = cleanAnswer.split(/[,\s]+/).filter(Boolean);
      const result = {};
      
      parts.forEach(part => {
        const [variable, value] = part.split('=').map(s => s.trim());
        // Convert variable to lowercase for case-insensitive comparison
        result[variable.toLowerCase()] = parseFloat(value);
      });
      
      return result;
    }
    
    // For simple comma-separated or space-separated values
    const parts = cleanAnswer.split(/[,\s]+/).filter(Boolean).map(part => parseFloat(part.trim()));
    if (parts.length === 1) {
      // Round to 3 decimal places for single numbers (likely probability)
      return { probability: Math.round(parts[0] * 1000) / 1000 };
    }
    return { x: parts[0], y: parts[1] };
  } catch (error) {
    console.error('Error parsing answer:', error);
    throw new Error('Invalid answer format');
  }
};

const checkAnswer = (userAnswer, correctAnswer) => {
  const tolerance = 0.01; // Smaller tolerance for probabilities
  
  try {
    console.log('Checking answer:', { userAnswer, correctAnswer, tolerance });

    // Convert all keys to lowercase for case-insensitive comparison
    const normalizedUserAnswer = Object.fromEntries(
      Object.entries(userAnswer).map(([k, v]) => [k.toLowerCase(), parseFloat(v)])
    );
    const normalizedCorrectAnswer = Object.fromEntries(
      Object.entries(correctAnswer).map(([k, v]) => [k.toLowerCase(), parseFloat(v)])
    );

    console.log('Normalized answers:', { 
      normalizedUserAnswer, 
      normalizedCorrectAnswer 
    });

    // Special handling for probability answers
    if ('probability' in normalizedCorrectAnswer || 'x' in normalizedCorrectAnswer) {
      const correctValue = normalizedCorrectAnswer.probability || normalizedCorrectAnswer.x;
      const userValue = normalizedUserAnswer.probability || normalizedUserAnswer.x;
      
      // Round both values to 3 decimal places
      const roundedCorrect = Math.round(correctValue * 1000) / 1000;
      const roundedUser = Math.round(userValue * 1000) / 1000;
      
      console.log('Probability comparison:', {
        correctValue,
        userValue,
        roundedCorrect,
        roundedUser,
        difference: Math.abs(roundedCorrect - roundedUser)
      });

      return Math.abs(roundedCorrect - roundedUser) <= tolerance;
    }

    // For other types of answers, check each value
    const results = Object.entries(normalizedCorrectAnswer).map(([key, value]) => {
      const userValue = normalizedUserAnswer[key];
      const exactMatch = Math.abs(value - userValue) <= tolerance;
      const roundedCorrectMatch = Math.abs(Math.round(value) - userValue) <= tolerance;
      const roundedUserMatch = Math.abs(value - Math.round(userValue)) <= tolerance;
      
      console.log(`Checking ${key}:`, {
        correctValue: value,
        userValue,
        difference: Math.abs(value - userValue),
        exactMatch,
        roundedCorrectMatch,
        roundedUserMatch
      });

      return exactMatch || roundedCorrectMatch || roundedUserMatch;
    });

    const isCorrect = results.every(r => r);
    console.log('Final result:', isCorrect);
    return isCorrect;
  } catch (error) {
    console.error('Error checking answer:', error);
    return false;
  }
}; 