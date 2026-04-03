'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, DollarSign, BookOpen, Shield, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function AdminCourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await fetch(`/api/admin/courses/${id}`);
        if (res.ok) {
          setCourse(await res.json());
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to load course properties');
        }
      } catch (err) {
        setError('Network error occurred.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourseDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-500">Retrieving course metrics...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!course) return null;

  const totalRevenue = course.price * (course.students?.length || 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/admin/courses" 
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Course Analytics</h1>
      </div>

      {/* Main Stats Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col sm:flex-row">
          <img src={course.coverImage} alt={course.title} className="w-full sm:w-64 h-48 sm:h-auto object-cover" />
          <div className="p-6 flex flex-col justify-center w-full">
            <h2 className="text-3xl font-extrabold text-gray-900 line-clamp-2">{course.title}</h2>
            <p className="text-gray-500 mt-2 line-clamp-2">{course.description || 'No description provided.'}</p>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-sm font-bold">
                <DollarSign className="w-4 h-4"/> 
                Unit Price: ${course.price}
              </span>
              <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-medium">
                <BookOpen className="w-4 h-4"/> 
                {course.contents?.length || 0} Modules
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm p-6 text-white flex flex-col justify-center">
          <h3 className="text-blue-100 font-medium tracking-wide text-sm uppercase">Total Projected Revenue</h3>
          <div className="text-5xl font-extrabold my-3 flex items-center">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-auto text-blue-50 font-medium bg-white/10 w-fit px-3 py-1.5 rounded-lg">
            <Users className="w-4 h-4"/>
            {course.students?.length || 0} Active Enrollments
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Roster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Student Roster
              </h2>
              <span className="text-sm text-gray-500">{course.students?.length || 0} enrolled</span>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Student</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Joined Range</th>
                    <th className="p-4 font-medium text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {course.students && course.students.length > 0 ? (
                    course.students.map(student => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm font-bold text-gray-900">{student.name}</td>
                        <td className="p-4 text-sm text-gray-500">{student.email}</td>
                        <td className="p-4 text-sm text-gray-500">{new Date(student.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-sm text-right">
                          <Link href={`/dashboard/admin/student/${student._id}`} className="text-blue-600 hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">No students enrolled yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Instructor & Material */}
        <div className="space-y-6">
          {/* Instructor Block */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
             <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4 pb-3 border-b">
                <Shield className="w-5 h-5 text-indigo-600" />
                Assigned Instructor
              </h2>
              {course.teacher ? (
                <div className="space-y-3">
                  <div className="text-lg font-bold text-gray-900">{course.teacher.name}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4"/> {course.teacher.email}
                  </div>
                  <span className={`inline-block mt-2 px-2.5 py-1 rounded text-xs font-bold uppercase ${course.teacher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Account {course.teacher.status}
                  </span>
                </div>
              ) : (
                <p className="text-gray-500 italic">No instructor currently assigned.</p>
              )}
          </div>

          {/* Curriculum Index */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-h-[500px] overflow-y-auto">
             <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4 pb-3 border-b">
                <BookOpen className="w-5 h-5 text-orange-500" />
                Course Curriculum Outline
              </h2>
              {course.contents && course.contents.length > 0 ? (
                <ul className="space-y-4">
                  {course.contents.map((item, idx) => (
                    <li key={item._id} className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{idx + 1}. {item.title}</span>
                      <span className="text-xs text-gray-500 uppercase mt-1 font-medium">{item.type} Module</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No course materials uploaded yet.</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
