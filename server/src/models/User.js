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
    type: Object,
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
    this.topicLevels = {};
  }
  
  // Get current level with proper numeric conversion
  const currentLevel = Number(this.topicLevels[topic]) || 1.0;
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
      this.topicLevels[topic] = Math.round(newLevel * 10) / 10;
      console.log('New level after increase:', this.topicLevels[topic]);
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
      this.topicLevels[topic] = Math.round(newLevel * 10) / 10;
      console.log('New level after decrease:', this.topicLevels[topic]);
      this.consecutiveIncorrect = 0;
    }
  }

  // Ensure the topic level is still in the object before saving
  if (!(topic in this.topicLevels)) {
    this.topicLevels[topic] = currentLevel;
    console.log('Restored missing topic level for:', topic);
  }

  // Calculate and update the average math level from practiced topics
  const levels = Object.values(this.topicLevels)
    .map(level => Number(level))
    .filter(level => !isNaN(level) && level >= 1);
  
  console.log('All topic levels before save:', {...this.topicLevels});

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
  
  return this.topicLevels[topic];
};

// Method to get topic level
userSchema.methods.getTopicLevel = function(topic) {
  const level = Number(this.topicLevels?.[topic]);
  return !isNaN(level) && level >= 1 ? level : 1.0;
};

// Method to get all topic levels
userSchema.methods.getAllTopicLevels = function() {
  return Object.fromEntries(
    Object.entries(this.topicLevels || {}).map(([topic, level]) => {
      const numericLevel = Number(level);
      return [topic, !isNaN(numericLevel) && numericLevel >= 1 ? numericLevel : 1.0];
    })
  );
};

// Add pre-save middleware to calculate mathLevel
userSchema.pre('save', function(next) {
  // Create a copy of topicLevels to prevent modification during save
  const currentTopicLevels = { ...this.topicLevels };
  
  // Only calculate if topicLevels exists and has values
  if (currentTopicLevels && Object.keys(currentTopicLevels).length > 0) {
    const validLevels = Object.entries(currentTopicLevels)
      .filter(([topic, level]) => typeof level === 'number' && !isNaN(level) && level > 0)
      .map(([topic, level]) => ({ topic, level }));
    
    if (validLevels.length > 0) {
      const sum = validLevels.reduce((a, b) => a + b.level, 0);
      this.mathLevel = parseFloat((sum / validLevels.length).toFixed(2));
      
      // Ensure all valid levels are preserved
      validLevels.forEach(({ topic, level }) => {
        if (!this.topicLevels[topic]) {
          this.topicLevels[topic] = level;
        }
      });
      
      console.log('Pre-save: Updated mathLevel to', this.mathLevel, 'from topics:', {...this.topicLevels});
    } else {
      this.mathLevel = 1.0;
      console.log('Pre-save: Reset mathLevel to 1.0 due to no valid topic levels');
    }
  } else {
    this.mathLevel = 1.0;
    console.log('Pre-save: Set default mathLevel to 1.0');
  }
  
  // Mark topicLevels as modified to ensure it's saved
  this.markModified('topicLevels');
  next();
});

const User = mongoose.model('User', userSchema);

export default User;