'use client';
import { useEffect, useState } from 'react';
import { Shield, BookOpen } from 'lucide-react';

export default function AdminCoursesManager() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cPrice, setCPrice] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/admin/users?role=teacher')
      ]);
      setCourses(cRes.ok ? await cRes.json() : []);
      setTeachers(tRes.ok ? await tRes.json() : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cTitle, description: cDesc, price: Number(cPrice) })
      });
      if (res.ok) {
        setCTitle(''); setCDesc(''); setCPrice(0);
        alert('Course created directly!');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create course');
      }
    } catch (err) {
      alert('Failed to create course');
    }
  };

  const handleAssignTeacher = async (courseId, teacherId) => {
    if (!teacherId) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/assign-teacher`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId })
      });
      if (res.ok) await fetchData();
      else alert('Failed to assign teacher');
    } catch (err) {
      alert('Failed to assign teacher');
    }
  };

  if (loading) return <div>Loading course catalog...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Course Organization</h1>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl">
        <h2 className="text-lg font-bold mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-blue-600" /> Create Course</h2>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <input type="text" placeholder="Title" required value={cTitle} onChange={e=>setCTitle(e.target.value)} className="border border-gray-300 rounded p-2 text-sm w-full" />
          <textarea placeholder="Description" required value={cDesc} onChange={e=>setCDesc(e.target.value)} rows="3" className="border border-gray-300 rounded p-2 text-sm w-full"></textarea>
          <input type="number" placeholder="Price ($)" required value={cPrice} onChange={e=>setCPrice(e.target.value)} className="border border-gray-300 rounded p-2 text-sm w-full" />
          <button className="bg-blue-600 text-white rounded py-2 px-4 text-sm font-medium hover:bg-blue-700 w-full">Deploy Course Catalog</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Course Index</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Students Enrolled</th>
                <th className="p-4 font-medium">Lecturer Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{c.title}</td>
                  <td className="p-4 text-gray-500">${c.price}</td>
                  <td className="p-4 text-gray-500">{c.students?.length || 0}</td>
                  <td className="p-4 text-right flex items-center gap-3">
                    {c.teacher?.name && <span className="text-sm font-medium">Current: {c.teacher.name}</span>}
                    <select 
                      className="border border-gray-300 rounded text-sm p-1"
                      defaultValue=""
                      onChange={(e) => handleAssignTeacher(c._id, e.target.value)}
                    >
                      <option value="" disabled>{c.teacher ? 'Re-assign...' : 'Assign Lecturer...'}</option>
                      {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
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
