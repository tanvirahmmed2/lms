'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'student') {
      alert('Only students can enroll in courses.');
      return;
    }
    try {
      const res = await fetch(`/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course._id })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully enrolled! Check your dashboard.');
        router.push('/dashboard/student');
      } else {
        alert(data.error || 'Enrollment failed');
      }
    } catch (err) {
      alert('Enrollment failed');
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading course...</div>;
  if (!course) return <div className="p-12 text-center text-gray-500">Course not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 sm:p-12 bg-blue-600 text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                {course.title}
              </h1>
              <p className="text-blue-100 flex items-center font-medium">
                Instructor: {course.teacher?.name || 'TBA'}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 text-center min-w-[140px]">
              <div className="text-sm text-blue-100 mb-1">One-time payment</div>
              <div className="text-3xl font-bold">${course.price}</div>
            </div>
          </div>
          
          <div className="p-8 sm:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this course</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </section>
            
            <div className="pt-8 border-t border-gray-100">
              <button
                onClick={handleEnroll}
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
