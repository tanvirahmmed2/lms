'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, GraduationCap, Video } from 'lucide-react';

export default function TeacherOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teacher/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading your analytics...</div>;
  if (!stats?.overview) return <div className="text-red-500">Failed to load statistics.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Educator Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 font-medium">Total Courses Managed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overview.assignedCourses}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 font-medium">Students Subscribed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overview.totalEnrollments}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Video className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 font-medium">Published Content</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overview.totalContent}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
        <h2 className="text-lg font-bold mb-6 text-gray-800">Student Enrollment per Course</h2>
        {stats.chartData?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No active enrollments detected to display charts.
          </div>
        )}
      </div>
    </div>
  );
}
