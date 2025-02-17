import { generateMathQuestion } from './mathGeneratorService.js';
import { QUESTIONS_BANK } from '../data/questionsBank.js';

export class QuestionService {
  static async generateQuestion(topic, difficulty) {
    try {
      // First try to get a question from the question bank
      if (QUESTIONS_BANK[topic]) {
        const availableQuestions = QUESTIONS_BANK[topic].filter(q => q.difficulty <= difficulty);
        if (availableQuestions.length > 0) {
          const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
          return selectedQuestion.generator();
        }
      }

      // If no suitable question found in the bank, use the math generator
      return generateMathQuestion(topic, difficulty);
    } catch (error) {
      console.error('Error generating question:', error);
      throw error;
    }
  }

  static async generateQuestionsForLevel(topic, level, count = 5) {
    const questions = [];
    for (let i = 0; i < count; i++) {
      const question = await this.generateQuestion(topic, level);
      questions.push(question);
    }
    return questions;
  }

  static checkAnswer(userAnswer, correctAnswer) {
    try {
      console.log('QuestionService checking answer:', { userAnswer, correctAnswer });

      // If the answers are objects (e.g., for questions with multiple parts)
      if (typeof userAnswer === 'object' && typeof correctAnswer === 'object') {
        // For probability questions, normalize the answer format
        if (correctAnswer.probability !== undefined || correctAnswer.x !== undefined) {
          const correctValue = correctAnswer.probability || correctAnswer.x;
          const userValue = userAnswer.probability || userAnswer.x;

          // Convert both values to numbers
          const correctNum = Number(correctValue);
          const userNum = Number(userValue);

          if (isNaN(correctNum) || isNaN(userNum)) {
            console.log('Invalid number conversion:', { correctNum, userNum });
            return false;
          }

          // Round to 3 decimal places for comparison
          const roundedCorrect = Math.round(correctNum * 1000) / 1000;
          const roundedUser = Math.round(userNum * 1000) / 1000;

          console.log('Probability comparison:', {
            correctValue,
            userValue,
            roundedCorrect,
            roundedUser
          });

          // Use a more forgiving tolerance for probability questions (0.005 = 0.5%)
          return Math.abs(roundedCorrect - roundedUser) <= 0.005;
        }

        // For multiple value answers, filter out empty values
        return Object.entries(correctAnswer)
          .filter(([key, value]) => value !== undefined && value !== '')
          .every(([key, value]) => {
            const userValue = userAnswer[key];
            return this.compareValues(userValue, value);
          });
      }

      // For direct value comparison
      return this.compareValues(userAnswer, correctAnswer);
    } catch (error) {
      console.error('Error in QuestionService.checkAnswer:', error);
      return false;
    }
  }

  static compareValues(userValue, correctValue) {
    try {
      // Convert both values to numbers
      const userNum = Number(userValue);
      const correctNum = Number(correctValue);

      // Check if both values are valid numbers
      if (isNaN(userNum) || isNaN(correctNum)) {
        // If not numbers, compare as strings
        return String(userValue).trim().toLowerCase() === String(correctValue).trim().toLowerCase();
      }

      const difference = Math.abs(userNum - correctNum);
      const relativeError = correctNum !== 0 ? difference / Math.abs(correctNum) : difference;
      const tolerance = 0.01; // 1% tolerance

      const isExactMatch = userNum === correctNum;
      const isWithinTolerance = difference <= tolerance;
      const isWithinRelativeError = relativeError <= tolerance;

      console.log('Comparing numbers:', {
        userNum,
        correctNum,
        difference,
        relativeError,
        tolerance,
        isExactMatch,
        isWithinTolerance,
        isWithinRelativeError
      });

      // Return true if any of the conditions are met
      return isExactMatch || isWithinTolerance || isWithinRelativeError;
    } catch (error) {
      console.error('Error in QuestionService.compareValues:', error);
      return false;
    }
  }

  static calculateNewLevel(currentLevel, isCorrect, consecutiveCorrect = 0, consecutiveWrong = 0) {
    let newLevel = currentLevel;
    let levelChange = 0;
    
    if (isCorrect) {
      consecutiveCorrect++;
      consecutiveWrong = 0;
      
      if (consecutiveCorrect >= 3) {
        levelChange = 0.5;
      } else if (consecutiveCorrect >= 2) {
        levelChange = 0.25;
      }
    } else {
      consecutiveWrong++;
      consecutiveCorrect = 0;
      
      if (consecutiveWrong >= 2) {
        levelChange = -0.5;
      } else {
        levelChange = -0.25;
      }
    }
    
    newLevel = Math.max(1, Math.min(5, currentLevel + levelChange));
    
    return {
      newLevel: parseFloat(newLevel.toFixed(2)),
      levelChange,
      consecutiveCorrect,
      consecutiveWrong
    };
  }
} 