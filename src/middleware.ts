import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
 
const publicRoutes = ['/login', '/']
 
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)
 
  // const payload = await verifySession();
  // if (!isPublicRoute && !payload) {
  //   return NextResponse.redirect(new URL('/login', req.nextUrl))
  // }
 
  // if (
  //   isPublicRoute &&
  //   payload?.id &&
  //   !req.nextUrl.pathname.startsWith('/inventory')
  // ) {
  //   return NextResponse.redirect(new URL('/inventory', req.nextUrl))
  // }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico$).*)'],
}