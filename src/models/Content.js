import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['youtube', 'pdf'], required: true },
  url: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Content || mongoose.model('Content', contentSchema);
