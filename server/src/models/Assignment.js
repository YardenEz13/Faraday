// server/src/models/Assignment.js
import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: Object,
    required: true,
    he: String,
    en: String
  },
  topic: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  questions: [{
    title: String,
    description: String,
    equation: String,
    hints: [String],
    solution: mongoose.Schema.Types.Mixed,
    studentAnswer: String,
    isCorrect: Boolean,
    difficulty: Number,
    _questionData: {
      topic: String,
      difficulty: Number,
      solution: mongoose.Schema.Types.Mixed
    }
  }],
  dueDate: Date,
  isCompleted: {
    type: Boolean,
    default: false
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  isAdaptive: {
    type: Boolean,
    default: true
  },
  grade: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'submitted', 'graded'],
    default: 'active'
  },
  submittedAt: Date,
  studentLevel: {
    type: Number,
    default: 1
  },
  minQuestionsRequired: {
    type: Number,
    default: 5
  },
  canSubmitEarly: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for better query performance
assignmentSchema.index({ teacherId: 1, student: 1, classId: 1 });
assignmentSchema.index({ student: 1, status: 1 });
assignmentSchema.index({ classId: 1, status: 1 });

// Add method to check if student can submit early
assignmentSchema.methods.canSubmitEarlyNow = function() {
  return this.canSubmitEarly && 
         this.currentQuestionIndex >= this.minQuestionsRequired &&
         this.correctAnswers / this.currentQuestionIndex >= 0.7;
};

// Add method to calculate final grade
assignmentSchema.methods.calculateGrade = function() {
  if (this.questions.length === 0) return 0;
  return Math.round((this.correctAnswers / this.questions.length) * 100);
};

// Add pre-save middleware to sync studentLevel with user's mathLevel
assignmentSchema.pre('save', async function(next) {
  if (this.isModified('student') || !this.studentLevel) {
    try {
      const User = mongoose.model('User');
      const student = await User.findById(this.student);
      if (student) {
        this.studentLevel = student.mathLevel;
        console.log('Pre-save: Synced assignment studentLevel with user mathLevel:', this.studentLevel);
      }
    } catch (error) {
      console.error('Error syncing studentLevel:', error);
    }
  }
  next();
});

// Add method to update studentLevel
assignmentSchema.methods.updateStudentLevel = async function() {
  try {
    const User = mongoose.model('User');
    const student = await User.findById(this.student);
    if (student) {
      this.studentLevel = student.mathLevel;
      await this.save();
      console.log('Updated assignment studentLevel to:', this.studentLevel);
    }
  } catch (error) {
    console.error('Error updating studentLevel:', error);
  }
};

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;

