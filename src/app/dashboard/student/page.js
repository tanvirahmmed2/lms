'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const res = await fetch('/api/my-courses');
        if (res.ok) {
          const data = await res.json();
          setSubscriptions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledCourses();
  }, []);

  if (loading) return <div>Loading your learning journey...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <Link href="/courses" className="text-sm font-semibold text-blue-600 hover:text-blue-800">Browse more courses &rarr;</Link>
      </div>
      
      <h2 className="text-xl font-semibold mb-6">My Enrollments</h2>
      
      {subscriptions.length === 0 ? (
        <div className="bg-white p-12 border border-gray-200 rounded-xl text-center shadow-sm">
          <p className="text-gray-500 mb-4 text-lg">You haven't enrolled in any courses yet.</p>
          <Link href="/courses" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subscriptions.map(sub => (
            <div key={sub._id} className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded inline-block mb-3">Enrolled</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{sub.courseId?.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{sub.courseId?.description}</p>
              </div>
              <div className="bg-gray-50 p-4 border-t border-gray-100">
                <Link
                  href={`/dashboard/student/course/${sub.courseId?._id}`}
                  className="w-full inline-block text-center font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded border border-blue-100 hover:bg-blue-100 transition"
                >
                  Go to Classroom
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
