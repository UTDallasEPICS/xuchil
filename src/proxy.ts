import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET;
const encodedKey = secretKey ? new TextEncoder().encode(secretKey) : null;

const PUBLIC_PATHS = ['/login'];

async function isSessionValid(req: NextRequest): Promise<boolean> {
  const sessionCookie = req.cookies.get('session')?.value;
  if (!sessionCookie || !encodedKey) return false;
  try {
    await jwtVerify(sessionCookie, encodedKey, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // API routes: return 401 if not authenticated (except auth endpoints)
  if (path.startsWith('/api')) {
    if (!path.startsWith('/api/auth')) {
      const valid = await isSessionValid(req);
      if (!valid) {
        return new NextResponse(null, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  // Page routes: check session for login redirect logic
  const valid = await isSessionValid(req);

  // Not authenticated and not on a public page → redirect to login
  if (!valid && !PUBLIC_PATHS.includes(path)) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Routes proxy should not run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico$).*)'],
}