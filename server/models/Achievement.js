import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['streak', 'nutrition', 'exercise', 'milestone', 'wellness', 'social'],
    required: true
  },
  requirement: {
    type: { type: String },
    target: Number
  },
  xpReward: {
    type: Number,
    default: 50
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
}, {
  timestamps: true
});

export default mongoose.model('Achievement', achievementSchema);
