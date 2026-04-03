'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, BarChart3, PlusCircle, GraduationCap } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading dashboard...</div>;
  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
          { name: 'Staff', href: '/dashboard/admin/users', icon: Users },
          { name: 'Students', href: '/dashboard/admin/student', icon: GraduationCap },
          { name: 'Courses', href: '/dashboard/admin/courses', icon: BookOpen },
        ];
      case 'teacher':
        return [
          { name: 'Analytics', href: '/dashboard/teacher', icon: BarChart3 },
          { name: 'My Courses', href: '/dashboard/teacher/courses', icon: BookOpen },
        ];
      case 'student':
        return [
          { name: 'My Learning', href: '/dashboard/student', icon: BookOpen },
          { name: 'Catalog', href: '/courses', icon: PlusCircle },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{user.role} workspace</span>
        </div>
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {getLinks().map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
