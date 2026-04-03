import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sendRecoveryEmail } from '@/lib/brevo';

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      
      return NextResponse.json({ error: 'If an account exists, an email is sent' }, { status: 200 });
    }

    
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = Date.now() + 10 * 60 * 1000; 

    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    await sendRecoveryEmail(user.email, resetCode);

    return NextResponse.json({ message: 'Recovery code sent successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
