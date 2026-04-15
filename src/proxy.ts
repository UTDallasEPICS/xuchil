import { NextRequest, NextResponse } from 'next/server'
import {verifySession} from "@/lib/session";

const PUBLIC_PATHS = ['/login'];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const payload = await verifySession();

  // API routes: return 401 if not authenticated (except auth endpoints)
  if (path.startsWith('/api')) {
    if (!path.startsWith('/api/auth')) {
      if (!payload) {
        return new NextResponse(null, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  // Not authenticated and not on a public page → redirect to login
  if (!payload && !PUBLIC_PATHS.includes(path)) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Routes proxy should not run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico$).*)'],
}