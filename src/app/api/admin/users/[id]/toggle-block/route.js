import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    
    const userToBlock = await User.findById(id);
    if (!userToBlock) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userToBlock.role === 'admin') {
      return NextResponse.json({ error: 'Cannot block an admin' }, { status: 400 });
    }

    userToBlock.status = userToBlock.status === 'blocked' ? 'active' : 'blocked';
    await userToBlock.save();

    return NextResponse.json({ message: `User is now ${userToBlock.status}`, user: userToBlock }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
