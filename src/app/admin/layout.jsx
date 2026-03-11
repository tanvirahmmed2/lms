'use client';

import Sidebar from '@/components/Sidebar';
import { Users, LayoutDashboard, Settings } from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/settings', label: 'Platform Settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="hidden md:block">
        <Sidebar links={adminLinks} />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
