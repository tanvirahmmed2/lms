'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, UserCircle, Mail, Calendar, BookOpen, ShieldCheck, Ban, Clock } from 'lucide-react';
import Link from 'next/link';

export default function StudentDetailProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (res.ok) {
        setStudent(await res.json());
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to load student');
      }
    } catch (err) {
      setError('An error occurred while fetching the profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchStudent();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500">Loading student profile...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!student) return <div className="p-8 text-gray-500">Student not found.</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header and navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/admin/student" 
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Student Profile Summary</h1>
      </div>

      {/* Main Profile Header */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 font-bold text-4xl flex items-center justify-center uppercase shrink-0">
          {student.name.charAt(0)}
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{student.name}</h2>
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <Mail className="w-4 h-4" />
              <span>{student.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              Joined {new Date(student.createdAt).toLocaleDateString()}
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded text-sm text-gray-700">
              {student.status === 'active' ? (
                <ShieldCheck className="w-4 h-4 text-green-500" />
              ) : (
                <Ban className="w-4 h-4 text-red-500" />
              )}
              <span className="capitalize">{student.status} Status</span>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-sm font-medium">
              <BookOpen className="w-4 h-4" />
              {student.enrolledCourses?.length || 0} Courses Enrolled
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-800">Enrolled Courses</h2>
        </div>
        
        <div className="p-6">
          {!student.enrolledCourses || student.enrolledCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-400 flex flex-col items-center">
              <BookOpen className="w-12 h-12 mb-3 text-gray-200" />
              <p>This student is not enrolled in any courses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {student.enrolledCourses.map((course) => (
                <div key={course._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                  {course.coverImage ? (
                    <img 
                      src={course.coverImage} 
                      alt={course.title} 
                      className="w-full h-40 object-cover border-b border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                      <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <div className="mt-auto pt-4 flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-500">${course.price}</span>
                      <Link 
                        href={`/courses/${course._id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Visit Course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
