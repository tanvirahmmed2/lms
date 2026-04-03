import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Subscription from '@/models/Subscription';
import Course from '@/models/Course'; // So that it populates cleanly
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden. Student only' }, { status: 403 });
    }

    await connectDB();
    const subscriptions = await Subscription.find({ 
      studentId: payload.id, 
      status: 'active' 
    }).populate('courseId');

    return NextResponse.json(subscriptions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
