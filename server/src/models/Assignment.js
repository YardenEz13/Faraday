// server/src/models/Assignment.js
import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  equation: {
    type: String,
    required: true
  },
  solution: {
    steps: [String],
    answer: String,
    final_answers: {
      x: String,
      y: String
    }
  },
  hints: [String],
  dueDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  studentAnswer: {
    type: String,
    default: null
  },
  isSurrendered: {
    type: Boolean,
    default: false
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add indexes
AssignmentSchema.index({ teacher: 1, student: 1 }); // For querying assignments by teacher/student
AssignmentSchema.index({ dueDate: 1 }); // For querying upcoming assignments
AssignmentSchema.index({ isCompleted: 1 }); // For querying completed/incomplete assignments

export const Assignment = mongoose.model('Assignment', AssignmentSchema);
