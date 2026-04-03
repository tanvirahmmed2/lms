'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function CourseClassroom() {
  const { courseId } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (courseId) fetchContent();
  }, [courseId]);

  if (loading) return <div>Loading classroom...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight border-b pb-4">
        Course Material
      </h1>
      
      {contents.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
          <p className="text-gray-500 font-medium">No lessons published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {contents.map((content, index) => (
            <div key={content._id} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{index + 1}</span>
                  {content.title}
                </h3>
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${content.type === 'youtube' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {content.type}
                </span>
              </div>
              
              <div className="p-6">
                {content.type === 'youtube' && (
                  <div className="relative overflow-hidden w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe 
                      src={content.url} 
                      title={content.title}
                      className="absolute top-0 left-0 w-full h-full rounded shadow-sm"
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                {content.type === 'pdf' && (
                  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded border border-gray-200">
                    <div className="text-6xl mb-4">📄</div>
                    <a 
                      href={content.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition"
                    >
                      Open PDF Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
