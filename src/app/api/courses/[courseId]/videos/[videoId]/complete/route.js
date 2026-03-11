import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Video from '@/models/Video';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, videoId } = params;
    await dbConnect();

    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video || video.courseId.toString() !== courseId) {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      userId: session.user.id,
      courseId,
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'Not enrolled in this course' }, { status: 403 });
    }

    // Mark as complete if not already
    if (!enrollment.completedVideos.includes(videoId)) {
      enrollment.completedVideos.push(videoId);
      await enrollment.save();
    }

    return NextResponse.json(
      { message: 'Video marked as completed', completedVideos: enrollment.completedVideos },
      { status: 200 }
    );
  } catch (error) {
    console.error('Complete video error:', error);
    return NextResponse.json({ message: 'Error marking video complete' }, { status: 500 });
  }
}
