import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import Subscription from '@/models/Subscription';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden. Student only' }, { status: 403 });
    }

    await connectDB();
    const { courseId } = await req.json();
    const studentId = payload.id;

    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    const existing = await Subscription.findOne({ studentId, courseId });
    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
      } else {
        existing.status = 'active';
        await existing.save();
        return NextResponse.json(existing, { status: 200 });
      }
    }

    const subscription = await Subscription.create({
      studentId,
      courseId,
      status: 'active'
    });

    course.students.push(studentId);
    await course.save();

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
