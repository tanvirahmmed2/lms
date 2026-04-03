import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/Content';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'teacher') {
      // Admin could also be permitted, but prompt explicitly said POST: teacher
      return NextResponse.json({ error: 'Forbidden. Teacher only' }, { status: 403 });
    }

    await connectDB();
    const { courseId, title, type, url, textContent } = await req.json();
    
    if (type !== 'text' && !url) {
      return NextResponse.json({ error: 'URL is required for this content type' }, { status: 400 });
    }
    if (type === 'text' && !textContent) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }
    
    // verify teacher is assigned to this course
    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    if (course.teacher?.toString() !== payload.id) {
      return NextResponse.json({ error: 'Not assigned to this course' }, { status: 403 });
    }

    const content = await Content.create({ courseId, title, type, url, textContent });
    
    course.contents.push(content._id);
    await course.save();

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
