'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldCheck, UserCog, Mail, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchUsers() {
      if (session?.user?.role === 'ADMIN') {
        try {
          const res = await fetch('/api/admin/users');
          if (res.ok) {
            const data = await res.json();
            setUsers(data);
          }
        } catch (error) {
          console.error('Failed to fetch users', error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchUsers();
  }, [session]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) => (user._id === userId ? { ...user, role: newRole } : user))
        );
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      alert('Error updating user role');
    }
  };

  if (loading || status === 'loading') {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  // Calculate some simple metrics
  const totalStudents = users.filter((u) => u.role === 'STUDENT').length;
  const totalTeachers = users.filter((u) => u.role === 'TEACHER').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600">Manage your platform, users, and global settings.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {[
          { label: 'Total Students', value: totalStudents, color: 'bg-green-500' },
          { label: 'Platform Teachers', value: totalTeachers, color: 'bg-blue-500' },
          { label: 'Administrators', value: totalAdmins, color: 'bg-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">{stat.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <UserCog className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold leading-6 text-gray-900">User Management</h3>
          <p className="mt-1 text-sm text-gray-500">Appoint teachers or administrators</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-sm">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold uppercase ring-2 ring-white">
                          {user.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-bold leading-5 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={user._id === session.user.id} // Don't allow changing own role easily
                      className="block w-full text-xs rounded-md border-gray-300 py-1.5 pl-3 pr-10 hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors bg-gray-50 border disabled:opacity-50 font-medium"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
