'use client';

import Sidebar from '@/components/Sidebar';
import { BookOpen, GraduationCap } from 'lucide-react';

const studentLinks = [
  { href: '/dashboard', label: 'My Learning', icon: GraduationCap },
  { href: '/courses', label: 'Browse Courses', icon: BookOpen },
];

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block">
        <Sidebar links={studentLinks} />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
