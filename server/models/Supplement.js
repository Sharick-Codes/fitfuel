import mongoose from 'mongoose';

const supplementSchema = new mongoose.Schema({
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
  supplements: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      default: ''
    },
    taken: {
      type: Boolean,
      default: false
    },
    time: Date
  }]
}, {
  timestamps: true
});

supplementSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Supplement', supplementSchema);
