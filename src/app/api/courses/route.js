import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Video from '@/models/Video';

export async function GET(req) {
  try {
    await dbConnect();
    // In a real app we would only fetch isPublished: true, 
    // but for demo purposes we can fetch all or handle appropriately
    const courses = await Course.find({}).populate('teacherId', 'name email').sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    return NextResponse.json({ message: 'Error fetching courses' }, { status: 500 });
  }
}
