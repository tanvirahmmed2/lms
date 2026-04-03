import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Protect /dashboard and all nested routes
  if (pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based routing protection
    if (pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/dashboard/teacher') && payload.role !== 'teacher') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (pathname.startsWith('/dashboard/student') && payload.role !== 'student') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const res = NextResponse.next();
    // Re-set user info headers for convenience in server components if needed
    res.headers.set('x-user-id', payload.id);
    res.headers.set('x-user-role', payload.role);
    return res;
  }

  // Also protect auth-limited APIs (like /api/auth/create-teacher requires admin)
  if (pathname.startsWith('/api/auth/create-teacher')) {
    const token = req.cookies.get('token')?.value;
    const payload = token ? await verifyToken(token) : null;
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/auth/create-teacher'],
};
