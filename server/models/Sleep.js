import mongoose from 'mongoose';

const sleepSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  bedtime: {
    type: String // "22:30" format
  },
  wakeTime: {
    type: String // "06:30" format
  },
  totalHours: {
    type: Number,
    min: 0,
    max: 24
  },
  quality: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  notes: {
    type: String,
    maxlength: 300
  }
}, {
  timestamps: true
});

sleepSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Sleep', sleepSchema);
