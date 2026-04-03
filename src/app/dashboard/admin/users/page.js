'use client';
import { useEffect, useState } from 'react';
import { Ban, CheckCircle, Shield, Trash2 } from 'lucide-react';

export default function AdminUsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Teacher Creation Forms
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPassword, setTPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users?role=admin,teacher');
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId) => {
    if (!confirm('Are you sure you want to change this user\'s access?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-block`, { method: 'PUT' });
      if (res.ok) fetchUsers();
      else alert('Failed to toggle block status');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
      else alert('Failed to delete user');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/create-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tName, email: tEmail, password: tPassword })
      });
      if (res.ok) {
        setTName(''); setTEmail(''); setTPassword('');
        alert('Teacher created successfully');
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create teacher');
      }
    } catch (err) {
      alert('Failed to create teacher');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Staff Management</h1>

      {/* Teacher Creation Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl">
        <h2 className="text-lg font-bold mb-4 flex items-center"><Shield className="w-5 h-5 mr-2 text-blue-600" /> Create Teacher Account</h2>
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Name" required value={tName} onChange={e=>setTName(e.target.value)} className="border border-gray-300 rounded p-2 text-sm w-full" />
            <input type="email" placeholder="Email" required value={tEmail} onChange={e=>setTEmail(e.target.value)} className="border border-gray-300 rounded p-2 text-sm w-full" />
          </div>
          <input type="password" placeholder="Temporary Password" required value={tPassword} onChange={e=>setTPassword(e.target.value)} className="border border-gray-300 rounded p-2 text-sm w-full" />
          <button className="bg-blue-600 text-white rounded py-2 px-4 text-sm font-medium hover:bg-blue-700 w-full">Provision Teacher</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">All Registered Staff</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{u.name}</td>
                  <td className="p-4 text-gray-500 text-sm">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.status === 'blocked' ? (
                       <span className="flex items-center text-red-600 text-sm font-medium"><Ban className="w-4 h-4 mr-1"/> Blocked</span>
                    ) : (
                       <span className="flex items-center text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4 mr-1"/> Active</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleBlock(u._id)}
                          className={`text-sm px-3 py-1 rounded border transition-colors ${u.status === 'blocked' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'}`}
                        >
                          {u.status === 'blocked' ? 'Unblock' : 'Block User'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-sm px-3 py-1 rounded border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors flex items-center"
                          title="Permanently Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
