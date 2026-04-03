'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ManageCourseContent() {
  const { courseId } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('youtube');
  const [url, setUrl] = useState('');

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/content/${courseId}`);
      if (res.ok) {
        setContents(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchContent();
  }, [courseId]);

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, title, type, url })
      });
      if (res.ok) {
        setTitle(''); setUrl('');
        alert('Content added successfully');
        fetchContent();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add content');
      }
    } catch (err) {
      alert('Failed to add content');
    }
  };

  if (loading) return <div>Loading content...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Course Content</h1>
        
        {contents.length === 0 ? (
          <div className="bg-white p-8 border border-gray-200 rounded-xl text-center shadow-sm text-gray-500">
            No content yet. Add lessons using the form.
          </div>
        ) : (
          <div className="space-y-4">
            {contents.map(content => (
              <div key={content._id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900">{content.title}</h3>
                  <a href={content.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-[200px] sm:max-w-md block">
                    {content.url}
                  </a>
                </div>
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full whitespace-nowrap ${content.type === 'youtube' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {content.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="xl:col-span-1">
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Lesson</h2>
          <form className="space-y-4" onSubmit={handleAddContent}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lesson Title</label>
              <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                <option value="youtube">YouTube Video</option>
                <option value="pdf">PDF Link</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content URL</label>
              <input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-bold hover:bg-blue-700 transition">
              Publish Content
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
