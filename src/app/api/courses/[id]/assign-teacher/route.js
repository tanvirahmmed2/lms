import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin only' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    // Assuming backend body passes { teacherId }
    // The prompt says "Assign a teacher to a course", the body can be flexible.
    const { teacherId } = body;

    let course = await Course.findById(id);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    course.teacher = teacherId;
    await course.save();

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
