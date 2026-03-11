import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Default role is STUDENT unless specified AND allowed by the platform logic.
    // In a real app, only ADMINs should be able to create TEACHER or ADMIN roles,
    // but for demo purposes, we will allow creating TEACHER for easy setup.
    const allowedRoles = ['STUDENT', 'TEACHER'];
    const assignedRole = allowedRoles.includes(role) ? role : 'STUDENT';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Error registering user' }, { status: 500 });
  }
}
