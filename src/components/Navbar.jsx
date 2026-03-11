'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="h-16 bg-white border-b border-gray-200 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ElevateLMS
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Browse Courses
            </Link>
            
            {!session ? (
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{session.user.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{session.user.role.toLowerCase()}</span>
                </div>
                
                {/* Dashboard Link based on Role */}
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                    Admin Panel
                  </Link>
                )}
                {session.user.role === 'TEACHER' && (
                  <Link href="/teacher/courses" className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    Teacher Dashboard
                  </Link>
                )}
                {session.user.role === 'STUDENT' && (
                  <Link href="/dashboard" className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    My Learning
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
