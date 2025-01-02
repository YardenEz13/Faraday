import { getRepository } from 'typeorm';
import { Practice, User, TopicProgress } from '../models';

export class AnalyticsService {
  static async getUserAnalytics(userId) {
    const practiceRepo = getRepository(Practice);
    const progressRepo = getRepository(TopicProgress);
    
    const practices = await practiceRepo.find({
      where: { user: userId },
      order: { timestamp: 'DESC' },
      take: 100
    });
    
    const progress = await progressRepo.find({
      where: { user: userId }
    });
    
    // Calculate learning velocity
    const learningVelocity = this.calculateLearningVelocity(practices);
    
    // Calculate mastery distribution
    const masteryDistribution = this.calculateMasteryDistribution(progress);
    
    // Calculate optimal study times
    const optimalTimes = this.findOptimalStudyTimes(practices);
    
    return {
      learningVelocity,
      masteryDistribution,
      optimalTimes,
      recentPerformance: this.analyzeRecentPerformance(practices),
      strengthsWeaknesses: this.identifyStrengthsWeaknesses(progress)
    };
  }
  
  static calculateLearningVelocity(practices) {
    const weeklyProgress = {};
    practices.forEach(practice => {
      const week = this.getWeekNumber(practice.timestamp);
      if (!weeklyProgress[week]) {
        weeklyProgress[week] = {
          correct: 0,
          total: 0
        };
      }
      weeklyProgress[week].total++;
      if (practice.isCorrect) weeklyProgress[week].correct++;
    });
    
    return Object.entries(weeklyProgress).map(([week, stats]) => ({
      week,
      accuracy: stats.correct / stats.total,
      volume: stats.total
    }));
  }
  
  static calculateMasteryDistribution(progress) {
    const distribution = {
      novice: 0,    // 0-0.3
      learning: 0,  // 0.3-0.6
      proficient: 0,// 0.6-0.9
      master: 0     // 0.9-1.0
    };
    
    progress.forEach(p => {
      if (p.mastery >= 0.9) distribution.master++;
      else if (p.mastery >= 0.6) distribution.proficient++;
      else if (p.mastery >= 0.3) distribution.learning++;
      else distribution.novice++;
    });
    
    return distribution;
  }
  
  static findOptimalStudyTimes(practices) {
    const hourlySuccess = Array(24).fill({ correct: 0, total: 0 });
    
    practices.forEach(practice => {
      const hour = practice.timestamp.getHours();
      hourlySuccess[hour].total++;
      if (practice.isCorrect) hourlySuccess[hour].correct++;
    });
    
    return hourlySuccess
      .map((stats, hour) => ({
        hour,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
        volume: stats.total
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 3);
  }
} 