import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
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
  exerciseName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'sports', 'other'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  intensity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  caloriesBurned: {
    type: Number,
    required: true,
    min: 0
  },
  sets: Number,
  reps: Number,
  weight: Number, // weight used in kg (for strength training)
  notes: {
    type: String,
    maxlength: 300
  }
}, {
  timestamps: true
});

exerciseSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Exercise', exerciseSchema);
