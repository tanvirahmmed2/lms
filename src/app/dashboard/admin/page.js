'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Users, GraduationCap, Video, CreditCard } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading insights...</div>;
  if (!stats?.overview) return <div className="text-red-500">Failed to load statistics.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Platform Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center shadow-red-50">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 font-medium">Students</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overview.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 font-medium">Teachers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overview.totalTeachers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Video className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 font-medium">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900">{stats.overview.totalCourses}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500 font-medium">Est. Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${stats.overview.revenue}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Student Sign-ups</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.userTrends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip />
              <Area type="monotone" dataKey="students" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <h2 className="text-lg font-bold mb-6 text-gray-800">System Distribution</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Active Subscriptions', count: stats.overview.totalSubscriptions },
              { name: 'Active Courses', count: stats.overview.totalCourses },
              { name: 'Teachers', count: stats.overview.totalTeachers }
            ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
