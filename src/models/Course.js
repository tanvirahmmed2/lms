import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    imageUrl: {
      type: String, // Optional URL for course thumbnail
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course must belong to a teacher'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
