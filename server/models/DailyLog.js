import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
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
  weight: {
    type: Number,
    min: 30,
    max: 300
  },
  bodyFat: {
    type: Number,
    min: 1,
    max: 60
  },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    arms: Number,
    thighs: Number
  },
  waterIntake: {
    type: Number,
    default: 0
  },
  waterTarget: {
    type: Number,
    default: 8
  },
  caloriesConsumed: {
    type: Number,
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  netCalories: {
    type: Number,
    default: 0
  },
  macros: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 }
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'bad'],
    default: 'okay'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

dailyLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model('DailyLog', dailyLogSchema);
