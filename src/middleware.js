import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const payload = token ? await verifyToken(token) : null;

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard')) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const roles = ['admin', 'teacher', 'student'];
    for (const role of roles) {
      if (pathname.startsWith(`/dashboard/${role}`) && payload.role !== role) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    const res = NextResponse.next();
    res.headers.set('x-user-id', payload.id);
    res.headers.set('x-user-role', payload.role);
    return res;
  }

  if (pathname.startsWith('/api/auth/create-teacher')) {
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/api/auth/create-teacher', 
    '/login', 
    '/register'
  ],
};