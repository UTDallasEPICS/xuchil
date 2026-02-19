import { cache } from 'react';
import { cookies } from 'next/headers';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import prisma from '@/lib/db';

export default interface SessionPayload {
  authUserId: number
  workerId: number | null
  isAdmin: boolean
}

const EXPIRATION_MS = 2 * 24 * 60 * 60 * 1000

const secretKey = process.env.SESSION_SECRET || 's';
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
  } catch (error) {
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

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });

}

export async function updateSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  const payload = await decrypt(session)
  if (!session || !payload) {
    return null
  }
  const expiresAt = new Date(Date.now() + EXPIRATION_MS);
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  // get cookie
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  // decrypt payload
  const payload = await decrypt(session);
  return payload;
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
  } catch (error) {
    console.log('Failed to fetch user');
    return null;
  }
})