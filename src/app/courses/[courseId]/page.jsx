'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { BookOpen, Video, CheckCircle, Lock, PlayCircle, Loader2 } from 'lucide-react';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${params.courseId}`);
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        setCourseData(data);
      } catch (err) {
        setError('Could not load course details.');
      } finally {
        setLoading(false);
      }
    }

    if (params?.courseId) {
      fetchCourse();
    }
  }, [params?.courseId]);

  const handleEnroll = async () => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${params.courseId}/enroll`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error('Enrollment failed');
      
      // Auto redirect to the learning portal for this course
      router.push(`/dashboard/learn/${params.courseId}`);
    } catch (err) {
      setError('Failed to enroll. Please try again.');
      setEnrolling(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !courseData?.course) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900">Course Not Found</h2>
          <p className="text-gray-500">{error || 'This course might have been removed.'}</p>
          <Link href="/courses" className="text-blue-600 hover:text-blue-700 font-medium inline-block mt-4">
            ← Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const { course, videos, isEnrolled } = courseData;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)] pb-20">
      {/* Course Header Banner */}
      <div className="bg-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 z-0" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2 space-y-6">
            <Link href="/courses" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 transition-colors">
               ← Browse all courses
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
              {course.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
                Created by <span className="text-slate-200">{course.teacherId?.name}</span>
              </span>
            </div>
          </div>
          
          {/* Action Card */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-2xl border border-gray-100 text-gray-900 transform lg:-translate-y-4">
            <div className="text-center space-y-6">
              <div className="text-4xl font-extrabold">
                {course.price > 0 ? `$${course.price}` : 'Free'}
              </div>
              
              {isEnrolled ? (
                <Link
                  href={`/dashboard/learn/${course._id}`}
                  className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {enrolling ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              )}
              
              <ul className="text-sm text-left space-y-3 pt-6 border-t border-gray-100">
                <li className="flex items-start text-gray-600">
                  <Video className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  <span>High-quality video lessons</span>
                </li>
                <li className="flex items-start text-gray-600">
                  <CheckCircle className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  <span>Structured progression path</span>
                </li>
                <li className="flex items-start text-gray-600">
                  <PlayCircle className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  <span>Lifetime access</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Course Curriculum
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {videos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No videos have been added to this course yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {videos.map((video, index) => (
                  <li key={video._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{video.title}</h4>
                        {video.isFree && !isEnrolled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Free Preview
                          </span>
                        )}
                      </div>
                    </div>
                    {isEnrolled || video.isFree ? (
                      <PlayCircle className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
