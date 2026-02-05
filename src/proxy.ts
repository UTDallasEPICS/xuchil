import {NextRequest, NextResponse} from 'next/server'
import {verifySession} from '@/lib/session'

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  if (path.startsWith('/api')) {
    if (!path.startsWith('/api/auth')) {
      const payload = await verifySession()
      if (!payload) {
        return new NextResponse(
          null,
          {status: 401}
        )
      }
    }
  }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico$).*)'],
}