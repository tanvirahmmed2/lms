'use client';
import { useEffect, useState } from 'react';
import { Search, UserCircle, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminStudentsManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/users?role=student');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        setFilteredStudents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this student?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStudents();
      else alert('Failed to delete student');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  if (loading) return <div>Loading students...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
        <UserCircle className="w-6 h-6 mr-3 text-blue-600" />
        Student Directory
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center  flex-col sm:flex-row gap-4">
          <h2 className="font-bold text-gray-700">All Registered Students</h2>
          
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded outline-none focus:border-blue-500 transition-colors text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Joined Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr key={student._id} className="hover:bg-gray-50 group">
                    <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                        {student.name.charAt(0)}
                      </div>
                      {student.name}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{student.email}</td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-3">
                      <Link 
                        href={`/dashboard/admin/student/${student._id}`} 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded transition-colors"
                      >
                        View Profile <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteStudent(student._id)}
                        className="text-sm px-2 py-1.5 rounded transition-colors text-red-600 hover:bg-red-50"
                        title="Permanently Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
