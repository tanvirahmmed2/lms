import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Video from '@/models/Video';
import Enrollment from '@/models/Enrollment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(req, { params }) {
  try {
    const { courseId } = params;
    await dbConnect();

    const course = await Course.findById(courseId).populate('teacherId', 'name');
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    let isEnrolled = false;
    let enrollment = null;

    if (session) {
      enrollment = await Enrollment.findOne({
        userId: session.user.id,
        courseId,
      });
      if (enrollment) {
        isEnrolled = true;
      }
    }

    // Fetch videos. If enrolled, return all videos. 
    // If not enrolled, only return the free preview videos.
    let videos = [];
    if (isEnrolled || session?.user?.role === 'ADMIN' || course.teacherId._id.toString() === session?.user?.id) {
      videos = await Video.find({ courseId }).sort({ position: 1 });
    } else {
      videos = await Video.find({ courseId, isFree: true }).sort({ position: 1 });
    }

    return NextResponse.json({
      course,
      videos,
      isEnrolled,
      completedVideos: enrollment?.completedVideos || [],
    });
  } catch (error) {
    console.error('Fetch course details error:', error);
    return NextResponse.json({ message: 'Error fetching course' }, { status: 500 });
  }
}
