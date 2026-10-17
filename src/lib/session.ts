import { cache } from 'react';
import { cookies } from 'next/headers';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import prisma from '@/lib/db';

export default interface SessionPayload {
  authUserId: number
  workerId: number | null
  isAdmin: boolean
}

// Cookie name is configurable so two local copies of the app can run side by side without
// overwriting each other's login (cookies are shared per host, not per port).
export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || 'session';

const EXPIRATION_MS = 2 * 24 * 60 * 60 * 1000

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error('SESSION_SECRET environment variable is not set');
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload, expiresAt: Date) {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);
}
   
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    console.log('Failed to verify session');
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  // calculate expiration one week from now
  const expiresAt = new Date(Date.now() + EXPIRATION_MS);
  // encrypt payload
  const session = await encrypt(payload, expiresAt);
  // set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function updateSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)?.value
  const payload = await decrypt(session)
  if (!session || !payload) {
    return null
  }
  const expiresAt = new Date(Date.now() + EXPIRATION_MS);
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// The cookie is a snapshot from login time. Re-read the user from the database on every
// request so that deactivating a user or changing isAdmin takes effect immediately,
// instead of only after they log out (the cookie lasts 2 days).
// Returns the payload with the live isAdmin value, or null if the user may no longer log in.
// Used by verifySession (API routes) and src/proxy.ts (page routes).
export async function checkSessionAgainstDb(payload: SessionPayload): Promise<SessionPayload | null> {
  try {
    const authUser = await prisma.authUser.findUnique({
      where: {
        id: payload.authUserId,
      },
      select: {
        isActive: true,
        isAdmin: true,
        worker: {
          select: {
            isActive: true,
            expiresAt: true,
          },
        },
      },
    });

    const worker = authUser?.worker as { isActive: boolean; expiresAt?: Date | null } | null | undefined;
    const workerExpired = worker?.expiresAt
      ? worker.expiresAt < new Date()
      : false;

    if (!authUser || !authUser.isActive || worker?.isActive === false || workerExpired) {
      return null;
    }

    return { ...payload, isAdmin: authUser.isAdmin };
  } catch {
    console.log('Failed to validate session');
    return null;
  }
}

export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  // get cookie
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  // decrypt payload
  const payload = await decrypt(session);
  if (!payload) {
    return null;
  }

  return checkSessionAgainstDb(payload);
})

export const getUser = cache(async () => {
  const payload = await verifySession();
  if (!payload) {
    return null;
  }
  try {
    const authUser = await prisma.authUser.findUnique({
      where: {
        id: payload.authUserId,
      },
      include: {
        worker: true,
      },
      omit: {
        passwordHash: true,
      }
    });

    return authUser;
  } catch {
    console.log('Failed to fetch user');
    return null;
  }
})