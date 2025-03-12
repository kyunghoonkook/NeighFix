import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// NextAuth 핸들러만 내보내기
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 