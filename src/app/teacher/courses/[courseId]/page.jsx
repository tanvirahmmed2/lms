'use client';

import { useState, useEffect } from 'next';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Plus, Video, Trash2, Youtube } from 'lucide-react';

export default function ManageCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // New video form
  const [videoTitle, setVideoTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'TEACHER')) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch course details
        const courseRes = await fetch(`/api/courses/${params.courseId}`);
        if (!courseRes.ok) throw new Error('Failed to fetch course');
        const courseData = await courseRes.json();
        setCourse(courseData.course);

        // Fetch videos for this course
        const videoRes = await fetch(`/api/teacher/courses/${params.courseId}/videos`);
        if (videoRes.ok) {
          const videoData = await videoRes.json();
          setVideos(videoData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.courseId]);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teacher/courses/${params.courseId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: videoTitle, youtubeUrl, isFree }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setVideos([...videos, data.video]);
        setIsAddingVideo(false);
        setVideoTitle('');
        setYoutubeUrl('');
        setIsFree(false);
      } else {
        alert('Failed to add video');
      }
    } catch (error) {
      alert('Error adding video');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === 'loading') {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!course) {
    return <div className="p-8">Course not found.</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <Link href="/teacher/courses" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Courses
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 text-lg mb-6">{course.description}</p>
        <div className="flex gap-4 border-t border-gray-100 pt-6">
          <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <span className="text-sm text-gray-500 block">Price</span>
            <span className="font-bold text-gray-900">${course.price}</span>
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <span className="text-sm text-gray-500 block">Status</span>
            <span className="font-bold text-green-700">Published</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Video className="h-6 w-6 text-blue-600" />
          Course Curriculum
        </h2>
        {!isAddingVideo && (
          <button
            onClick={() => setIsAddingVideo(true)}
            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200"
          >
            <Plus className="h-4 w-4" />
            Add Video
          </button>
        )}
      </div>

      {isAddingVideo && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8 animation-fade-in border-l-4 border-l-blue-600">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <Youtube className="h-5 w-5 text-red-500" />
            Add YouTube Lesson
          </h3>
          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
              <input
                required
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Lesson 1: Introduction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID or full URL</label>
              <input
                required
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="e.g. dQw4w9WgXcQ or https://youtube.com/watch?v=..."
              />
            </div>
            <div className="flex items-center">
              <input
                id="isFree"
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700">
                Set as Free Preview (Available without enrollment)
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Video'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingVideo(false)}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <Video className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No lessons yet</h3>
          <p className="mt-1 text-gray-500">Add some videos to build out your course curriculum.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {videos.map((video, index) => (
              <li key={video._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex flex-col items-center justify-center text-blue-700 font-bold border border-blue-100">
                    <span className="text-xs text-blue-400 -mb-1">Ep</span>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{video.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded text-xs truncate max-w-[200px]">
                        {video.youtubeUrl}
                      </span>
                      {video.isFree && (
                        <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Preview
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Future implementation: Reorder and Delete functionality */}
                <div className="text-sm font-medium text-gray-400">
                  Position: {video.position}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
