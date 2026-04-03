import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin Access Only.' }, { status: 403 });
    }

    await connectDB();
    
    const course = await Course.findById(id)
      .populate('teacher', 'name email status')
      .populate('students', 'name email status createdAt')
      .populate('contents', 'title type url');
      
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
