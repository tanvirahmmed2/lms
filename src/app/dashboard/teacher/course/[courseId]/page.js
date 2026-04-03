'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Trash2, Edit2 } from 'lucide-react';

export default function ManageCourseContent() {
  const { courseId } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('youtube');
  const [url, setUrl] = useState('');
  const [textContent, setTextContent] = useState('');

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

  const handleSaveContent = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingId ? `/api/content/item/${editingId}` : '/api/content';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId, 
          title, 
          type, 
          url: type !== 'text' ? url : '', 
          textContent: type === 'text' ? textContent : '' 
        })
      });

      if (res.ok) {
        cancelEdit();
        alert(editingId ? 'Content updated successfully' : 'Content added successfully');
        fetchContent();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save content');
      }
    } catch (err) {
      alert('Failed to save content');
    }
  };

  const handleDeleteContent = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this material?')) return;
    try {
      const res = await fetch(`/api/content/item/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchContent();
      } else {
        alert('Failed to delete content');
      }
    } catch (err) {
      alert('Failed to delete content');
    }
  };

  const startEdit = (content) => {
    setEditingId(content._id);
    setTitle(content.title);
    setType(content.type);
    setUrl(content.url || '');
    setTextContent(content.textContent || '');
    window.scrollTo(0, 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setType('youtube');
    setUrl('');
    setTextContent('');
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
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{content.title}</h3>
                  {content.type === 'text' ? (
                    <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-md block">
                      Text Module
                    </p>
                  ) : (
                    <a href={content.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-[200px] sm:max-w-md block">
                      {content.url}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full whitespace-nowrap ${content.type === 'youtube' ? 'bg-red-100 text-red-700' : content.type === 'text' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {content.type}
                  </span>
                  <div className="flex items-center gap-2 border-l pl-3 ml-1 border-gray-200">
                    <button onClick={() => startEdit(content)} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Edit Content">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteContent(content._id)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Delete Content">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="xl:col-span-1">
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            {editingId ? <><Edit2 className="w-5 h-5 text-blue-600"/> Edit Lesson</> : 'Add New Lesson'}
          </h2>
          <form className="space-y-4" onSubmit={handleSaveContent}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lesson Title</label>
              <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" disabled={!!editingId}>
                <option value="youtube">YouTube Video</option>
                <option value="pdf">PDF Link</option>
                <option value="link">External Link</option>
                <option value="text">Rich Text Module</option>
              </select>
            </div>
            {type === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Content Text (Markdown/Plaintext)</label>
                <textarea required value={textContent} onChange={e=>setTextContent(e.target.value)} rows="6" className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" placeholder="Type your lesson notes..."></textarea>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Content URL</label>
                <input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-bold hover:bg-blue-700 transition">
                {editingId ? 'Save Changes' : 'Publish Content'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="bg-gray-100 text-gray-700 border border-gray-300 rounded-lg py-2.5 px-4 font-bold hover:bg-gray-200 transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
