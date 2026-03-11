import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    isPurchased: {
      type: Boolean,
      default: false, // In a real app, updated after successful payment via Stripe/etc
    },
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
  },
  { timestamps: true }
);

// Ensure a user can only enroll in a course once
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
