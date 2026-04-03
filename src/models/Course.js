import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 0 },
  coverImage: { type: String, required: true },
  coverImageId: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  contents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }]
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
