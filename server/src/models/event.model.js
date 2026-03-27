import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  type: { type: String, enum: ['official', 'personal'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null if official
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model('Event', eventSchema);
