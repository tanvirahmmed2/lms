import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
    },
    youtubeUrl: {
      type: String, // Usually full url or just the video id like "dQw4w9WgXcQ"
      required: [true, 'YouTube URL or Video ID is required'],
    },
    position: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFree: {
      type: Boolean, // First video might be free as a preview
      default: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Video must belong to a course'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Video || mongoose.model('Video', videoSchema);
