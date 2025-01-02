import { getRepository } from 'typeorm';
import { User, TopicProgress, Practice } from '../models';

export class AdaptiveLearningService {
  static async updateUserProgress(userId, topic, isCorrect, hintsUsed) {
    const userRepo = getRepository(User);
    const progressRepo = getRepository(TopicProgress);
    
    const user = await userRepo.findOne(userId);
    let progress = await progressRepo.findOne({ where: { user, topic } });
    
    if (!progress) {
      progress = progressRepo.create({ user, topic });
    }
    
    // Update mastery based on performance
    const masteryChange = isCorrect ? 
      (1 - hintsUsed * 0.2) * (1 / Math.pow(2, progress.mastery)) : 
      -0.1 * progress.mastery;
    
    progress.mastery = Math.max(0, Math.min(1, progress.mastery + masteryChange));
    progress.lastPracticed = new Date();
    progress.totalAttempts++;
    if (isCorrect) progress.correctAnswers++;
    
    await progressRepo.save(progress);
    
    // Update user level and streak
    const allProgress = await progressRepo.find({ where: { user } });
    const averageMastery = allProgress.reduce((acc, p) => acc + p.mastery, 0) / allProgress.length;
    
    user.mathLevel = Math.max(1, averageMastery * 5);
    
    // Update streak
    const today = new Date();
    const lastStreak = user.lastStreak ? new Date(user.lastStreak) : null;
    
    if (!lastStreak || today.getDate() !== lastStreak.getDate()) {
      if (lastStreak && 
          today.getTime() - lastStreak.getTime() <= 48 * 60 * 60 * 1000) {
        user.streak++;
      } else {
        user.streak = 1;
      }
      user.lastStreak = today;
    }
    
    await userRepo.save(user);
    
    return { user, progress };
  }
  
  static async getNextQuestion(userId, topic) {
    const progressRepo = getRepository(TopicProgress);
    const progress = await progressRepo.findOne({ 
      where: { user: userId, topic } 
    });
    
    const difficulty = progress ? 
      Math.min(5, Math.max(1, Math.ceil(progress.mastery * 5))) : 1;
    
    // Generate question based on topic and difficulty
    const question = await this.generateQuestion(topic, difficulty);
    
    return {
      ...question,
      difficulty
    };
  }
  
  static async generateQuestion(topic, difficulty) {
    // Example prompt for LLM
    const prompt = `Generate a ${topic} math question at difficulty level ${difficulty}/5.
    Format: {
      "question": "the question text",
      "answer": "the correct answer",
      "hints": ["hint1", "hint2", "hint3"]
    }
    Rules:
    - Use only whole numbers
    - Make it clear and concise
    - Include step-by-step hints
    - Difficulty 1: Basic concepts
    - Difficulty 5: Complex applications`;
    
    // Call your LLM service here
    // const response = await llm.generate(prompt);
    // return JSON.parse(response);
    
    // Placeholder return
    return {
      question: "What is 6^2 + 8^2?",
      answer: "100",
      hints: [
        "Break it down: 6^2 = 36, 8^2 = 64",
        "Add the squares: 36 + 64",
        "36 + 64 = 100"
      ]
    };
  }
  
  static async getRecommendedTopics(userId) {
    const progressRepo = getRepository(TopicProgress);
    const progress = await progressRepo.find({ 
      where: { user: userId },
      order: { lastPracticed: 'ASC' }
    });
    
    const now = new Date();
    const recommendations = progress.map(p => {
      const daysSinceLastPractice = 
        (now.getTime() - p.lastPracticed.getTime()) / (1000 * 60 * 60 * 24);
      
      // Spaced repetition intervals based on mastery
      const reviewInterval = Math.pow(2, p.mastery * 5);
      const needsReview = daysSinceLastPractice >= reviewInterval;
      
      return {
        topic: p.topic,
        mastery: p.mastery,
        needsReview,
        priority: needsReview ? (daysSinceLastPractice / reviewInterval) : 0
      };
    });
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  }
  
  static calculateNextDifficulty(user, topic, lastPerformance) {
    const baseLevel = user.mathLevel;
    const topicMastery = user.progress[topic] || 0;
    const recentSuccess = lastPerformance.correct;
    const hintsUsed = lastPerformance.hintsUsed;
    
    // Base difficulty on user's math level and topic mastery
    let difficulty = baseLevel * (0.5 + topicMastery * 0.5);
    
    // Adjust based on recent performance
    if (recentSuccess && hintsUsed === 0) {
      difficulty *= 1.2; // Significant increase for perfect answer
    } else if (recentSuccess) {
      difficulty *= 1.1; // Modest increase for correct with hints
    } else {
      difficulty *= 0.9; // Decrease for incorrect
    }
    
    // Ensure difficulty stays within bounds
    return Math.min(5, Math.max(1, difficulty));
  }
  
  static async generateHints(question, difficulty) {
    const hintCount = Math.max(2, Math.min(5, Math.ceil(6 - difficulty)));
    
    const prompt = `
      For the math question: "${question}"
      Generate ${hintCount} hints that:
      1. Start general and become more specific
      2. Don't give away the answer
      3. Are clear and concise
      4. Are appropriate for difficulty level ${difficulty}/5
    `;
    
    // Call your LLM service here
    // const response = await llm.generate(prompt);
    // return response.hints;
    
    // Placeholder hints
    return [
      "Think about breaking down the problem into smaller parts",
      "Remember the relevant formula or rule",
      "Look for patterns or relationships",
      "Consider working backwards from what you know"
    ].slice(0, hintCount);
  }
  
  static calculateRewards(user, performance) {
    const rewards = [];
    
    // Streak rewards
    if (user.streak % 5 === 0) {
      rewards.push({
        type: 'streak',
        message: `${user.streak} day streak!`,
        points: user.streak * 10
      });
    }
    
    // Mastery rewards
    const topicMastery = user.progress[performance.topic];
    if (topicMastery >= 0.9) {
      rewards.push({
        type: 'mastery',
        message: `Topic Mastered!`,
        points: 100
      });
    }
    
    // Level up rewards
    const newLevel = Math.floor(user.mathLevel);
    const oldLevel = Math.floor(user.mathLevel - performance.levelGain);
    if (newLevel > oldLevel) {
      rewards.push({
        type: 'level',
        message: `Level Up! Now level ${newLevel}`,
        points: newLevel * 50
      });
    }
    
    return rewards;
  }
} 