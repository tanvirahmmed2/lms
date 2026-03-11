import Link from 'next/link';
import { BookOpen, DollarSign } from 'lucide-react';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  await dbConnect();
  // In a real app we would only fetch published courses
  const courses = await Course.find({}).populate('teacherId', 'name').sort({ createdAt: -1 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 pt-8 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Catalog</h1>
        <p className="text-lg text-gray-600">
          Discover our curated collection of courses created by expert teachers.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses available yet</h3>
          <p className="mt-1 text-gray-500">Check back later for new content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link key={course._id.toString()} href={`/courses/${course._id.toString()}`} className="group block h-full">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
                {course.imageUrl ? (
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-blue-200" />
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 line-clamp-2 mb-6 flex-1 text-sm">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                        {course.teacherId?.name?.charAt(0) || 'T'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                        {course.teacherId?.name}
                      </span>
                    </div>
                    <div className="flex items-center font-bold text-lg text-gray-900">
                      {course.price > 0 ? (
                        <>
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          {course.price}
                        </>
                      ) : (
                        <span className="text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Free</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
