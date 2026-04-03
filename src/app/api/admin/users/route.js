import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req) {
  try {
    await connectDB();
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role');
    
    let filter = {};
    if (roleFilter) {
      if (roleFilter.includes(',')) {
        filter.role = { $in: roleFilter.split(',') };
      } else {
        filter.role = roleFilter;
      }
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
