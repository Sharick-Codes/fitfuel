import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
    minlength: 6,
    select: false
  },
  googleId: {
    type: String,
    default: null
  },
  age: {
    type: Number,
    min: 13,
    max: 100
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  height: {
    type: Number, // in cm
    min: 100,
    max: 250
  },
  weight: {
    type: Number, // in kg
    min: 30,
    max: 300
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'veryActive'],
    default: 'moderate'
  },
  goal: {
    type: String,
    enum: ['lose', 'maintain', 'gain', 'recomp'],
    default: 'maintain'
  },
  targetWeight: {
    type: Number,
    min: 30,
    max: 300
  },
  profileImage: {
    type: String,
    default: ''
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'elite', 'legend'],
    default: 'beginner'
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastLogDate: { type: Date }
  },
  achievements: [{
    badgeId: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  preferences: {
    dietMode: {
      type: String,
      enum: ['all', 'vegetarian', 'vegan', 'keto', 'highProtein', 'lowCarb'],
      default: 'all'
    },
    fastingSchedule: {
      type: String,
      enum: ['none', '16:8', '18:6', '20:4', 'OMAD'],
      default: 'none'
    },
    darkMode: {
      type: Boolean,
      default: true
    },
    waterTarget: {
      type: Number,
      default: 8
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
