import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const handler = NextAuth(authOptions);

// In NextAuth v5 (beta), NextAuth() returns an object with a handlers property containing GET and POST
export const { GET, POST } = handler.handlers || handler;
