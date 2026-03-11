'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlayCircle, Clock, BookOpen, GraduationCap } from 'lucide-react';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchMyCourses() {
      if (session) {
        try {
          // For demo purposes, we will fetch all courses and filter by enrollment
          // In real app, we would have a specific GET /api/enrollments endpoint
          const res = await fetch('/api/courses');
          if (res.ok) {
            const allCourses = await res.json();
            
            // Fetch individual course enrollments concurrently to find enrolled ones
            const fetchPromises = allCourses.map(c => 
              fetch(`/api/courses/${c._id}`).then(r => r.json())
            );
            
            const results = await Promise.all(fetchPromises);
            
            const myEnrolledCourses = results.filter(r => r.isEnrolled).map(r => ({
              ...r.course,
              courseId: r.course._id,
              totalVideos: r.videos.length,
              completedVideos: r.completedVideos.length,
              progress: r.videos.length > 0 ? Math.round((r.completedVideos.length / r.videos.length) * 100) : 0
            }));
            
            setEnrollments(myEnrolledCourses);
          }
        } catch (error) {
          console.error('Failed to fetch enrolled courses', error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchMyCourses();
  }, [session]);

  if (loading || status === 'loading') {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          My Learning
        </h1>
        <p className="mt-2 text-gray-600">Track your progress and pick up exactly where you left off.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Start Your Journey</h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">You aren't enrolled in any courses yet. Browse our catalog to find your next favorite subject.</p>
          <div className="mt-8">
            <Link
              href="/courses"
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all font-medium"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrollments.map((course) => (
            <div key={course._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              {course.imageUrl ? (
                <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
              ) : (
                <div className="aspect-video w-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center relative overflow-hidden">
                  <BookOpen className="h-16 w-16 text-blue-200 group-hover:scale-110 transition-transform duration-500" />
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-gray-500 text-sm flex items-center gap-1 mb-6">
                  {course.teacherId?.name}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  
                  <Link
                    href={`/dashboard/learn/${course._id}`}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors gap-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {course.progress === 0 ? 'Start Course' : course.progress === 100 ? 'Review Course' : 'Resume Learning'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
