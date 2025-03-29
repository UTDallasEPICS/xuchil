import { cache } from 'react';
import { cookies } from 'next/headers';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import SessionPayload from '@/types/SessionPayload';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

const secretKey = process.env.SESSION_SECRET;
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
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt(payload, expiresAt);
  const cookieStore = await cookies();
 
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const payload = await decrypt(session);
  
  if (!payload?.id) {
    redirect('/login');
  }

  return payload;
})

export const getUser = cache(async () => {
  const payload = await verifySession();
  if (!payload) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
      omit: {
        passwordHash: true,
      }
    });

    return user;
  } catch (error) {
    console.log('Failed to fetch user');
    return null;
  }
})

export const getRole = cache(async () => {
  const user = await getUser();
  return user?.role;
})