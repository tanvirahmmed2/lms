import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    await dbConnect();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: session.user.id,
      courseId,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { message: 'Already enrolled in this course', enrollment: existingEnrollment },
        { status: 200 }
      );
    }

    // Creating enrollment. In a real app with payments, we'd verify Stripe webhook event etc.
    const newEnrollment = await Enrollment.create({
      userId: session.user.id,
      courseId,
      isPurchased: true, // Assuming success based on the prompt's simplicity
    });

    return NextResponse.json(
      { message: 'Enrolled successfully', enrollment: newEnrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ message: 'Error enrolling in course' }, { status: 500 });
  }
}
