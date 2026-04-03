import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/Content';
import Course from '@/models/Course';
import Subscription from '@/models/Subscription';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req, { params }) {
  const { courseId } = await params;
  try {
    await connectDB();
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    if (payload.role === 'student') {
      const isEnrolled = await Subscription.findOne({
        studentId: payload.id,
        courseId: courseId,
        status: 'active'
      });
      if (!isEnrolled) {
        return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
      }
    } else if (payload.role === 'teacher') {
      if (course.teacher?.toString() !== payload.id) {
        return NextResponse.json({ error: 'Not assigned to this course' }, { status: 403 });
      }
    }

    const contents = await Content.find({ courseId });
    return NextResponse.json(contents, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
