import mongoose from 'mongoose';

const waterLogSchema = new mongoose.Schema({
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
  glasses: {
    type: Number,
    default: 0,
    min: 0
  },
  target: {
    type: Number,
    default: 8,
    min: 1
  },
  timestamps: [{
    time: { type: Date, default: Date.now },
    amount: { type: Number, default: 1 }
  }]
}, {
  timestamps: true
});

waterLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model('WaterLog', waterLogSchema);
