'use client';

import { useState, useEffect } from 'next';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, PlayCircle, CheckCircle, Circle, Lock, Award, Loader2 } from 'lucide-react';

export default function LearnCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [courseData, setCourseData] = useState(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${params.courseId}`);
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        
        if (!data.isEnrolled && session?.user?.role !== 'ADMIN' && session?.user?.id !== data.course.teacherId?._id) {
           router.push(`/courses/${params.courseId}`);
           return;
        }

        setCourseData(data);
        
        // Find the first unwatched video to set as active
        if (data.videos && data.videos.length > 0) {
          const firstUnwatchedIndex = data.videos.findIndex(
            v => !data.completedVideos.includes(v._id)
          );
          setActiveVideoIndex(firstUnwatchedIndex !== -1 ? firstUnwatchedIndex : 0);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (params?.courseId && session) {
      fetchCourse();
    }
  }, [params?.courseId, session, router]);

  const handleMarkComplete = async () => {
    if (!courseData || markingComplete) return;

    const currentVideo = courseData.videos[activeVideoIndex];
    if (!currentVideo) return;
    
    // If already complete, just move to next
    if (courseData.completedVideos.includes(currentVideo._id)) {
      if (activeVideoIndex < courseData.videos.length - 1) {
        setActiveVideoIndex(activeVideoIndex + 1);
      }
      return;
    }

    setMarkingComplete(true);
    try {
      const res = await fetch(`/api/courses/${params.courseId}/videos/${currentVideo._id}/complete`, {
        method: 'POST',
      });
      
      if (res.ok) {
        const updateData = await res.json();
        setCourseData({
          ...courseData, 
          completedVideos: updateData.completedVideos
        });
        
        // Auto advance
        if (activeVideoIndex < courseData.videos.length - 1) {
          setActiveVideoIndex(activeVideoIndex + 1);
        }
      }
    } catch (err) {
      alert('Failed to mark complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url; // fallback, assume they pasted only id
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-900">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!courseData || !courseData.videos.length) {
    return <div className="p-8 text-center mt-20">No videos available for this course.</div>;
  }

  const activeVideo = courseData.videos[activeVideoIndex];
  const isLastVideo = activeVideoIndex === courseData.videos.length - 1;
  const isCompleted = courseData.completedVideos.includes(activeVideo?._id);
  const courseCompletionPercent = Math.round((courseData.completedVideos.length / courseData.videos.length) * 100);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-gray-900 overflow-hidden text-gray-100">
      
      {/* Video Player Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Top Navbar for Video */}
        <div className="h-16 border-b border-gray-800 bg-gray-900 flex items-center px-4 shrink-0 justify-between">
          <Link href="/dashboard" className="text-gray-400 hover:text-white flex items-center transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="text-gray-300 font-medium truncate max-w-sm ml-4">
            {courseData.course.title}
          </div>
        </div>

        {/* Player Container */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 shrink-0">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-800 relative">
              {activeVideo ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo.youtubeUrl)}?rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  className="w-full h-full absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
                  <PlayCircle className="h-16 w-16 mb-4 opacity-50" />
                  <p>Select a video to start learning</p>
                </div>
              )}
            </div>

            {/* Video Details & Action Area */}
            {activeVideo && (
              <div className="mt-8 bg-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-start border border-gray-700 shadow-xl">
                <div>
                  <div className="flex items-center gap-3 mb-2 text-blue-400 font-mono text-sm">
                    Lesson {activeVideoIndex + 1} of {courseData.videos.length}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {activeVideo.title}
                  </h2>
                </div>
                
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className={`shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${
                    isCompleted
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                  } disabled:opacity-50`}
                >
                  {markingComplete ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : isCompleted ? (
                    <>
                      {isLastVideo ? (
                        <>Course Completed <Award className="h-5 w-5"/></>
                      ) : (
                        <>Next Video →</>
                      )}
                    </>
                  ) : (
                    <>Mark as Complete <CheckCircle className="h-5 w-5"/></>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full md:w-80 lg:w-96 bg-gray-900 border-l border-gray-800 flex flex-col h-[50vh] md:h-full shrink-0">
        <div className="p-6 border-b border-gray-800 shrink-0">
          <h3 className="text-lg font-bold text-white mb-4">Course Content</h3>
          
          <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
            <span>Progress</span>
            <span>{courseCompletionPercent}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${courseCompletionPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {courseData.videos.map((video, index) => {
            const isActive = index === activeVideoIndex;
            const isFinished = courseData.completedVideos.includes(video._id);
            // Unleash next video if current is first, or previous is finished.
            // Also admins and teachers can view all.
            const previousFinished = index === 0 || courseData.completedVideos.includes(courseData.videos[index - 1]._id);
            const isUnlocked = previousFinished || session?.user?.role === 'ADMIN' || session?.user?.id === courseData.course.teacherId?._id;

            return (
              <button
                key={video._id}
                onClick={() => isUnlocked && setActiveVideoIndex(index)}
                disabled={!isUnlocked}
                className={`w-full text-left p-4 rounded-xl flex gap-4 transition-all ${
                  isActive 
                    ? 'bg-blue-900/30 border border-blue-500/30 text-white shadow-inner' 
                    : isUnlocked
                      ? 'hover:bg-gray-800 border border-transparent text-gray-300'
                      : 'opacity-50 cursor-not-allowed border border-transparent text-gray-500'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isFinished ? (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  ) : isActive ? (
                    <PlayCircle className="h-5 w-5 text-white" />
                  ) : !isUnlocked ? (
                    <Lock className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 truncate">
                  <div className={`font-semibold text-sm mb-1 ${isActive ? 'text-white' : ''}`}>
                    {video.title}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-200' : 'text-gray-500'} font-mono`}>
                    Lesson {index + 1}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
