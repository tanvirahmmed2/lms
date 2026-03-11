'use client';

import Sidebar from '@/components/Sidebar';
import { BookOpen, Video, BarChart } from 'lucide-react';

const teacherLinks = [
  { href: '/teacher/courses', label: 'My Courses', icon: BookOpen },
  { href: '/teacher/analytics', label: 'Analytics', icon: BarChart }, // Placeholder for future
];

export default function TeacherLayout({ children }) {
  return (
    <div className="flex bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block">
        <Sidebar links={teacherLinks} />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
