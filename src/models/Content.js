import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['youtube', 'pdf', 'link', 'text'], required: true },
  url: { type: String }, 
  textContent: { type: String } 
}, { timestamps: true });

export default mongoose.models.Content || mongoose.model('Content', contentSchema);
