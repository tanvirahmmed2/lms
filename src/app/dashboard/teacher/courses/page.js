'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (res.ok) {
          const assigned = data.filter(c => c.teacher && c.teacher._id === user._id);
          setCourses(assigned);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCourses();
  }, [user]);

  if (loading) return <div>Loading your assigned courses...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Your Assigned Courses</h1>
      
      {courses.length === 0 ? (
        <div className="bg-white p-8 border border-gray-200 rounded-xl text-center shadow-sm">
          <p className="text-gray-500">You currently have no assigned courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course._id} className="bg-white border rounded-xl shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
              </div>
              <Link
                href={`/dashboard/teacher/course/${course._id}`}
                className="mt-4 w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Manage Content
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
