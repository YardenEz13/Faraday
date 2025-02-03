import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    he: { type: String, required: true },
    en: { type: String, required: true }
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

classSchema.index({ teacherId: 1 });
const Class = mongoose.model('Class', classSchema);

export default Class; 