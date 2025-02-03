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
    title: {
      type: Object,
      he: String,
      en: String
    },
    description: {
      type: Object,
      he: String,
      en: String
    },
    equation: String,
    solution: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    hints: [String],
    studentAnswer: String,
    isCorrect: Boolean,
    submittedAt: Date
  }],
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'submitted', 'graded'],
    default: 'active'
  },
  dueDate: Date,
  isLate: {
    type: Boolean,
    default: false
  },
  grade: Number,
  submittedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for better query performance
assignmentSchema.index({ teacherId: 1, student: 1, classId: 1 });
assignmentSchema.index({ student: 1, status: 1 });
assignmentSchema.index({ classId: 1, status: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;

