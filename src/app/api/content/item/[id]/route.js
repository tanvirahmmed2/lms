import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/models/Content';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const content = await Content.findById(id);
    if (!content) return NextResponse.json({ error: 'Content not found' }, { status: 404 });

    const course = await Course.findById(content.courseId);
    if (course.teacher?.toString() !== payload.id) {
      return NextResponse.json({ error: 'Not your course' }, { status: 403 });
    }

    const { title, url, textContent } = await req.json();

    content.title = title || content.title;
    if (content.type === 'text') {
      content.textContent = textContent;
    } else {
      content.url = url;
    }

    await content.save();
    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const content = await Content.findById(id);
    if (!content) return NextResponse.json({ error: 'Content not found' }, { status: 404 });

    const course = await Course.findById(content.courseId);
    if (course.teacher?.toString() !== payload.id) {
      return NextResponse.json({ error: 'Not your course' }, { status: 403 });
    }

    // Pull from Course contents array
    await Course.findByIdAndUpdate(content.courseId, { $pull: { contents: id } });

    // Hard delete content
    await Content.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
