import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { QUESTIONS_BANK } from '../data/questionsBank.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  mathLevel: {
    type: Number,
    default: 1.0
  },
  // Add topic-specific levels for adaptive learning
  topicLevels: {
    type: Map,
    of: Number,
    default: {}
  },
  // Track consecutive correct/incorrect answers
  consecutiveCorrect: {
    type: Number,
    default: 0
  },
  consecutiveIncorrect: {
    type: Number,
    default: 0
  },
  // Add current practice question field
  currentQuestion: {
    topic: String,
    data: mongoose.Schema.Types.Mixed,
    solution: mongoose.Schema.Types.Mixed,
    timestamp: Date,
    question: {
      title: String,
      description: String,
      equation: String,
      hints: [String]
    }
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update topic level
userSchema.methods.updateTopicLevel = async function(topic, isCorrect) {
  // Ensure topic is a string
  if (!topic || typeof topic !== 'string') {
    throw new Error('Invalid topic parameter');
  }

  // Initialize topicLevels if it doesn't exist
  if (!this.topicLevels) {
    this.topicLevels = new Map();
  }
  
  // Get current level with proper numeric conversion
  const currentLevel = Number(this.topicLevels.get(topic)) || 1.0;
  console.log('Current level for topic', topic, ':', currentLevel);
  
  if (isCorrect) {
    this.consecutiveCorrect++;
    this.consecutiveIncorrect = 0;
    
    // Calculate level increase based on consecutive correct answers
    if (this.consecutiveCorrect >= 3) {
      let increase = 0;
      
      // More significant increase for longer streaks
      if (this.consecutiveCorrect >= 10) {
        increase = 1.0;
      } else if (this.consecutiveCorrect >= 7) {
        increase = 0.7;
      } else if (this.consecutiveCorrect >= 5) {
        increase = 0.5;
      } else {
        increase = 0.3;
      }
      
      const newLevel = Math.min(10, currentLevel + increase);
      this.topicLevels.set(topic, Math.round(newLevel * 10) / 10);
      console.log('New level after increase:', this.topicLevels.get(topic));
      this.consecutiveCorrect = 0;
    }
  } else {
    this.consecutiveIncorrect++;
    this.consecutiveCorrect = 0;
    
    // Calculate level decrease based on consecutive incorrect answers
    if (this.consecutiveIncorrect >= 2) {
      let decrease = 0;
      
      if (this.consecutiveIncorrect >= 5) {
        decrease = 1.0;
      } else if (this.consecutiveIncorrect >= 3) {
        decrease = 0.5;
      } else {
        decrease = 0.3;
      }
      
      const newLevel = Math.max(1, currentLevel - decrease);
      this.topicLevels.set(topic, Math.round(newLevel * 10) / 10);
      console.log('New level after decrease:', this.topicLevels.get(topic));
      this.consecutiveIncorrect = 0;
    }
  }

  // Calculate and update the average math level from practiced topics
  const levels = Array.from(this.topicLevels.values())
    .map(level => Number(level))
    .filter(level => !isNaN(level) && level >= 1);
  
  console.log('All topic levels:', levels);

  if (levels.length > 0) {
    const totalLevel = levels.reduce((sum, level) => sum + level, 0);
    this.mathLevel = Math.round((totalLevel / levels.length) * 10) / 10;
    console.log('New math level:', this.mathLevel);
  } else {
    this.mathLevel = 1.0;
    console.log('No valid levels found, setting math level to 1.0');
  }

  // Mark both fields as modified
  this.markModified('topicLevels');
  this.markModified('mathLevel');
  await this.save();
  
  return this.topicLevels.get(topic);
};

// Method to get topic level
userSchema.methods.getTopicLevel = function(topic) {
  const level = Number(this.topicLevels?.get(topic));
  return !isNaN(level) && level >= 1 ? level : 1.0;
};

// Method to get all topic levels
userSchema.methods.getAllTopicLevels = function() {
  return Object.fromEntries(
    Array.from(this.topicLevels || new Map()).map(([topic, level]) => {
      const numericLevel = Number(level);
      return [topic, !isNaN(numericLevel) && numericLevel >= 1 ? numericLevel : 1.0];
    })
  );
};

// Pre-save middleware to update mathLevel
userSchema.pre('save', function(next) {
  if (this.isModified('topicLevels')) {
    const levels = Array.from(this.topicLevels?.values() || [])
      .map(level => Number(level))
      .filter(level => !isNaN(level) && level >= 1);

    if (levels.length > 0) {
      const totalLevel = levels.reduce((sum, level) => sum + level, 0);
      this.mathLevel = Math.round((totalLevel / levels.length) * 10) / 10;
      console.log('Pre-save: updating math level to:', this.mathLevel);
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;