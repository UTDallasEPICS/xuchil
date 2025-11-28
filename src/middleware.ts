import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
 
const publicRoutes = ['/login', '/']
 
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  if (path.startsWith('/api') && !path.startsWith('/api/auth')) {
    const payload = await verifySession(req)
    if (!payload) {
      return new NextResponse(
        null,
        { status: 401}
      )
    }
  }

  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico$).*)'],
}