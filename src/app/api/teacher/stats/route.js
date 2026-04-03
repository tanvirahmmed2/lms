import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import Content from '@/models/Content';
import Subscription from '@/models/Subscription';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await connectDB();
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find all courses for this teacher
    const courses = await Course.find({ teacher: payload.id });
    const courseIds = courses.map(c => c._id);

    const [totalEnrollments, totalContent] = await Promise.all([
      Subscription.countDocuments({ courseId: { $in: courseIds }, status: 'active' }),
      Content.countDocuments({ courseId: { $in: courseIds } })
    ]);

    // Aggregate enrollments by course to generate simple chart data
    const enrollmentData = await Subscription.aggregate([
      { $match: { courseId: { $in: courseIds }, status: 'active' } },
      { $group: {
          _id: "$courseId",
          count: { $sum: 1 }
      }}
    ]);

    // Map `_id` to actual course titles
    const chartData = enrollmentData.map(stat => {
      const targetCourse = courses.find(c => c._id.toString() === stat._id.toString());
      return {
        name: targetCourse ? targetCourse.title : 'Unknown',
        students: stat.count
      };
    });

    return NextResponse.json({
      overview: {
        assignedCourses: courses.length,
        totalEnrollments,
        totalContent
      },
      chartData
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
