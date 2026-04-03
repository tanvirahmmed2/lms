import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import Content from '@/models/Content';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const course = await Course.findById(id)
      .populate('teacher', 'name email')
      .populate('contents');
      
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin only' }, { status: 403 });
    }

    await connectDB();
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const price = formData.get('price');
    const coverImage = formData.get('coverImage');

    let updateData = { title, description, price: Number(price) };

    if (coverImage && coverImage.size > 0 && typeof coverImage !== 'string') {
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'lms_courses' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(buffer);
      });
      updateData.coverImage = uploadResult.secure_url;
      updateData.coverImageId = uploadResult.public_id;

      // Delete old image
      if (existingCourse.coverImageId) {
        await cloudinary.uploader.destroy(existingCourse.coverImageId);
      }
    }

    const course = await Course.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin only' }, { status: 403 });
    }

    await connectDB();
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Delete image from cloudinary
    if (course.coverImageId) {
      await cloudinary.uploader.destroy(course.coverImageId);
    }

    await Course.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
