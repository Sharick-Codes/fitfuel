import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalType: {
    type: String,
    enum: ['weightLoss', 'muscleGain', 'maintenance', 'bodyRecomposition'],
    required: true
  },
  currentWeight: {
    type: Number,
    required: true
  },
  targetWeight: {
    type: Number,
    required: true
  },
  dailyCalorieTarget: {
    type: Number,
    required: true
  },
  dailyProteinTarget: Number,
  dailyCarbsTarget: Number,
  dailyFatsTarget: Number,
  trainingDayCalories: Number,
  restDayCalories: Number,
  targetDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDate: Date
}, {
  timestamps: true
});

goalSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Goal', goalSchema);
