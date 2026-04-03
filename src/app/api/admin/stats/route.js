import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Subscription from '@/models/Subscription';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await connectDB();
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalStudents, totalTeachers, totalCourses, totalSubscriptions] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Course.countDocuments(),
      Subscription.countDocuments()
    ]);

    
    const activeSubs = await Subscription.find({ status: 'active' }).populate('courseId');
    const revenue = activeSubs.reduce((acc, sub) => {
      
      
      return acc + (sub.courseId?.price || 0);
    }, 0);

   
    const userAggregate = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      overview: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalSubscriptions,
        revenue
      },
      userTrends: userAggregate.map(item => ({ name: item._id, students: item.count }))
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
