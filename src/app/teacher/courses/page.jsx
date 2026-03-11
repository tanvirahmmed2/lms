'use client';

import { useState, useEffect } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, MoreVertical, DollarSign } from 'lucide-react';

export default function TeacherCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // New course form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'TEACHER')) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchCourses() {
      if (session?.user?.role === 'TEACHER') {
        try {
          const res = await fetch('/api/teacher/courses');
          if (res.ok) {
            const data = await res.json();
            setCourses(data);
          }
        } catch (error) {
          console.error('Failed to fetch courses', error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchCourses();
  }, [session]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, price: Number(price) }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setCourses([data.course, ...courses]);
        setIsCreating(false);
        setTitle('');
        setDescription('');
        setPrice(0);
        router.push(`/teacher/courses/${data.course._id}`);
      }
    } catch (error) {
      alert('Error creating course');
    }
  };

  if (loading || status === 'loading') {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            My Courses
          </h1>
          <p className="mt-2 text-gray-600">Manage your courses or create new ones.</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="h-5 w-5" />
            New Course
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 mt-4 animation-fade-in text-gray-800">
          <h2 className="text-xl font-bold mb-4">Create a New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                placeholder="e.g. Advanced AI Prompting"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors min-h-[100px]"
                placeholder="What will students learn?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {courses.length === 0 && !isCreating ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses defined</h3>
          <p className="mt-1 text-gray-500">Get started by creating your first course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-1 text-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{course.title}</h3>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                  {course.price > 0 ? course.price : 'Free'}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
                <Link
                  href={`/teacher/courses/${course._id}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Edit Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
