'use client';
import { useEffect, useState } from 'react';
import { Shield, BookOpen, Edit2, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminCoursesManager() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cPrice, setCPrice] = useState(0);
  const [cCoverImage, setCCoverImage] = useState(null);

  const [editCourseId, setEditCourseId] = useState(null);
  const [eTitle, setETitle] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [ePrice, setEPrice] = useState(0);
  const [eCoverImage, setECoverImage] = useState(null);

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
    if (!cCoverImage) return alert('Cover image is mandatory');
    try {
      const formData = new FormData();
      formData.append('title', cTitle);
      formData.append('description', cDesc);
      formData.append('price', cPrice);
      formData.append('coverImage', cCoverImage);

      const res = await fetch('/api/courses', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setCTitle(''); setCDesc(''); setCPrice(0); setCCoverImage(null);
        alert('Course created successfully!');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create course');
      }
    } catch (err) {
      alert('Failed to create course');
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', eTitle);
      formData.append('description', eDesc);
      formData.append('price', ePrice);
      if (eCoverImage) formData.append('coverImage', eCoverImage);

      const res = await fetch(`/api/courses/${editCourseId}`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        setEditCourseId(null);
        alert('Course updated successfully!');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update course');
      }
    } catch (err) {
      alert('Failed to update course');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to delete course');
      }
    } catch (err) {
      alert('Failed to delete course');
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

      {editCourseId ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center"><Edit2 className="w-5 h-5 mr-2 text-blue-600" /> Edit Course</h2>
          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <input type="text" placeholder="Title" required value={eTitle} onChange={e=>setETitle(e.target.value)} className="border border-gray-300 rounded p-2 text-sm w-full" />
            <textarea placeholder="Description" required value={eDesc} onChange={e=>setEDesc(e.target.value)} rows="3" className="border border-gray-300 rounded p-2 text-sm w-full"></textarea>
            <input type="number" placeholder="Price ($)" required value={ePrice} onChange={e=>setEPrice(e.target.value)} className="border border-gray-300 rounded p-2 text-sm w-full" />
            <input type="file" accept="image/*" onChange={e=>setECoverImage(e.target.files[0])} className="border border-gray-300 rounded p-2 text-sm w-full" />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white rounded py-2 px-4 text-sm font-medium hover:bg-blue-700 flex-1">Update Course</button>
              <button type="button" onClick={() => setEditCourseId(null)} className="bg-gray-500 text-white rounded py-2 px-4 text-sm font-medium hover:bg-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-blue-600" /> Create Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <input type="text" placeholder="Title" required value={cTitle} onChange={e=>setCTitle(e.target.value)} className="border border-gray-300 rounded p-2 text-sm w-full" />
            <textarea placeholder="Description" required value={cDesc} onChange={e=>setCDesc(e.target.value)} rows="3" className="border border-gray-300 rounded p-2 text-sm w-full"></textarea>
            <input type="number" placeholder="Price ($)" required value={cPrice} onChange={e=>setCPrice(e.target.value)} className="border border-gray-300 rounded p-2 text-sm w-full" />
            <input type="file" accept="image/*" required onChange={e=>setCCoverImage(e.target.files[0])} className="border border-gray-300 rounded p-2 text-sm w-full" />
            <button type="submit" className="bg-blue-600 text-white rounded py-2 px-4 text-sm font-medium hover:bg-blue-700 w-full">Deploy Course Catalog</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Course Index</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Students Enrolled</th>
                <th className="p-4 font-medium">Lecturer Assignment</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    {c.coverImage ? (
                      <img src={c.coverImage} alt={c.title} className="w-16 h-10 object-cover rounded border border-gray-200" />
                    ) : (
                      <div className="w-16 h-10 bg-gray-200 rounded border border-gray-200"></div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-900">{c.title}</td>
                  <td className="p-4 text-gray-500">${c.price}</td>
                  <td className="p-4 text-gray-500">{c.students?.length || 0}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {c.teacher?.name && <span className="text-xs font-medium text-blue-600">Current: {c.teacher.name}</span>}
                      <select 
                        className="border border-gray-300 rounded text-sm p-1 max-w-[150px]"
                        defaultValue=""
                        onChange={(e) => handleAssignTeacher(c._id, e.target.value)}
                      >
                        <option value="" disabled>{c.teacher ? 'Re-assign...' : 'Assign Lecturer...'}</option>
                        {teachers.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-3 whitespace-nowrap">
                    <Link 
                      href={`/dashboard/admin/courses/${c._id}`}
                      className="text-gray-400 hover:text-green-600 transition-colors inline-block"
                      title="View Detailed Course Analytics"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </Link>
                    <button 
                      onClick={() => {
                        setEditCourseId(c._id);
                        setETitle(c.title);
                        setEDesc(c.description || '');
                        setEPrice(c.price || 0);
                        setECoverImage(null);
                        window.scrollTo(0, 0);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(c._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
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
