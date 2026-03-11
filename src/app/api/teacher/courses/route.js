import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET all courses for the logged-in teacher
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const courses = await Course.find({ teacherId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Fetch teacher courses error:', error);
    return NextResponse.json(
      { message: 'Error fetching courses' },
      { status: 500 }
    );
  }
}

// POST create a new course
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, price, imageUrl } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const newCourse = await Course.create({
      title,
      description,
      price: price || 0,
      imageUrl,
      teacherId: session.user.id,
    });

    return NextResponse.json(
      { message: 'Course created successfully', course: newCourse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { message: 'Error creating course' },
      { status: 500 }
    );
  }
}
