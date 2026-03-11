import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { role } = body;

    // Validate role
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      user: { id: updatedUser._id, name: updatedUser.name, role: updatedUser.role },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json({ message: 'Error updating user role' }, { status: 500 });
  }
}
