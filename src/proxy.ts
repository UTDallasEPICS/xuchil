import { NextRequest, NextResponse } from 'next/server'
import { applyCors, handleCorsPreflight } from '@/lib/cors'
import { SESSION_COOKIE, decrypt, checkSessionAgainstDb } from '@/lib/session'

const PUBLIC_PATHS = ['/login'];
// Pages only admins may open. Anyone else gets the 404 page (src/app/not-found.tsx),
// so the page's existence isn't revealed. Matches the path and everything under it.
const ADMIN_PATHS = ['/analytics'];
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/health'];

function isPublicApiPath(path: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function isAdminPath(path: string): boolean {
  return ADMIN_PATHS.some((p) => path === p || path.startsWith(p + '/'));
}

// Valid cookie AND user still active in the database, with the live isAdmin value.
// Checked on every request so a deactivated user is locked out immediately, even from
// API routes that don't call verifySession() themselves.
// (Next.js 16 runs proxy.ts on Node.js, so Prisma works here.)
async function getLiveSession(req: NextRequest) {
  const payload = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);
  return payload ? checkSessionAgainstDb(payload) : null;
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) {
    return preflightResponse;
  }

  // API routes: return 401 if not authenticated (except auth endpoints)
  if (path.startsWith('/api')) {
    if (!isPublicApiPath(path)) {
      if (!(await getLiveSession(req))) {
        return applyCors(req, new NextResponse(null, { status: 401 }));
      }
    }
    return applyCors(req, NextResponse.next());
  }

  // Page routes: check session for login redirect logic
  const session = await getLiveSession(req);

  // Not authenticated and not on a public page → redirect to login
  if (!session && !PUBLIC_PATHS.includes(path)) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but not admin on an admin-only page → show the 404 page instead.
  // Rewriting to a path with no page makes Next.js render not-found.tsx with a 404 status,
  // while the browser's URL bar keeps showing what the user typed.
  if (session && !session.isAdmin && isAdminPath(path)) {
    return NextResponse.rewrite(new URL('/404', req.url));
  }

  return NextResponse.next();
}

// Routes proxy should not run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico$).*)'],
}