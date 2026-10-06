import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
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
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  bodyPart: {
    type: String,
    enum: ['front', 'side', 'back', 'custom'],
    default: 'front'
  },
  weight: Number,
  notes: {
    type: String,
    maxlength: 300
  }
}, {
  timestamps: true
});

photoSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Photo', photoSchema);
