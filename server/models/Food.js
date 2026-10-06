import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'snack', 'dinner'],
    required: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  carbs: {
    type: Number,
    required: true,
    min: 0
  },
  fats: {
    type: Number,
    required: true,
    min: 0
  },
  fiber: {
    type: Number,
    default: 0,
    min: 0
  },
  servingSize: {
    type: Number,
    required: true
  },
  servingUnit: {
    type: String,
    required: true,
    default: 'g'
  },
  image: {
    type: String,
    default: ''
  },
  recipeVideoUrl: {
    type: String,
    default: ''
  },
  youtubeVideoId: {
    type: String,
    default: ''
  },
  prepTime: {
    type: String,
    default: ''
  },
  cookTime: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    enum: ['veg', 'nonveg', 'vegan', 'keto', 'highProtein', 'lowCarb', 'glutenFree', 'dairyFree']
  }],
  cuisine: {
    type: String,
    enum: ['indian', 'continental', 'asian', 'mediterranean', 'american', 'mexican', 'other'],
    default: 'other'
  },
  ingredients: [String],
  instructions: [String],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

foodSchema.index({ name: 'text' });
foodSchema.index({ category: 1, cuisine: 1 });

export default mongoose.model('Food', foodSchema);
