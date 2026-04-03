'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (res.ok) {
          setCourses(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch courses:', data);
          setCourses([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading courses...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Explore Courses</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <div key={course._id} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{course.title}</h3>
              <p className="text-sm text-gray-500 h-16 overflow-hidden line-clamp-3 mb-4">{course.description}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <span className="text-xl font-bold text-blue-600">${course.price}</span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {course.teacher ? course.teacher.name : 'TBA'}
                </span>
              </div>
              <Link
                href={`/courses/${course._id}`}
                className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            No courses available yet.
          </div>
        )}
      </div>
    </div>
  );
}
