import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Video from '@/models/Video';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// GET all videos for a specific course
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { courseId } = await params;
    await dbConnect();

    // Ensure the teacher actually owns this course
    const course = await Course.findOne({
      _id: courseId,
      teacherId: session.user.id,
    });

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found or unauthorized' },
        { status: 404 }
      );
    }

    const videos = await Video.find({ courseId }).sort({ position: 1 });

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Fetch videos error:', error);
    return NextResponse.json({ message: 'Error fetching videos' }, { status: 500 });
  }
}

// POST add a new video to a course
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { courseId } = await params;
    const { title, youtubeUrl, isFree } = await req.json();

    if (!title || !youtubeUrl) {
      return NextResponse.json(
        { message: 'Title and YouTube URL are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Ensure the teacher actually owns this course
    const course = await Course.findOne({
      _id: courseId,
      teacherId: session.user.id,
    });

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found or unauthorized' },
        { status: 404 }
      );
    }

    // Determine position (last video position + 1)
    const lastVideo = await Video.findOne({ courseId }).sort({ position: -1 });
    const position = lastVideo ? lastVideo.position + 1 : 1;

    const newVideo = await Video.create({
      title,
      youtubeUrl,
      position,
      isFree: isFree || false,
      courseId,
    });

    return NextResponse.json(
      { message: 'Video added successfully', video: newVideo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add video error:', error);
    return NextResponse.json({ message: 'Error adding video' }, { status: 500 });
  }
}
