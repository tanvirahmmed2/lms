import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().populate('teacher', 'name email');
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin only' }, { status: 403 });
    }

    await connectDB();
    const formData = await req.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const price = formData.get('price');
    const coverImage = formData.get('coverImage');

    if (!coverImage || coverImage.size === 0 || typeof coverImage === 'string') {
      return NextResponse.json({ error: 'Cover image is mandatory' }, { status: 400 });
    }

    let coverImageUrl = '';
    let coverImageId = '';
    
    const buffer = Buffer.from(await coverImage.arrayBuffer());
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'lms_courses' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });
    coverImageUrl = uploadResult.secure_url;
    coverImageId = uploadResult.public_id;

    const course = await Course.create({ 
      title, 
      description, 
      price: Number(price) || 0, 
      coverImage: coverImageUrl,
      coverImageId
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
