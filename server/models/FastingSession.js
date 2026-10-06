import mongoose from 'mongoose';

const fastingSessionSchema = new mongoose.Schema({
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
  schedule: {
    type: String,
    enum: ['16:8', '18:6', '20:4', 'OMAD', 'custom'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  targetHours: {
    type: Number,
    required: true
  },
  actualHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'broken'],
    default: 'active'
  }
}, {
  timestamps: true
});

fastingSessionSchema.index({ userId: 1, date: -1 });

export default mongoose.model('FastingSession', fastingSessionSchema);
