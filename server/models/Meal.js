import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
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
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'snack', 'dinner'],
    required: true
  },
  foods: [{
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    totalCalories: Number,
    totalProtein: Number,
    totalCarbs: Number,
    totalFats: Number
  }],
  totalMealCalories: {
    type: Number,
    default: 0
  },
  totalMealProtein: {
    type: Number,
    default: 0
  },
  totalMealCarbs: {
    type: Number,
    default: 0
  },
  totalMealFats: {
    type: Number,
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

mealSchema.index({ userId: 1, date: 1, mealType: 1 });

export default mongoose.model('Meal', mealSchema);
