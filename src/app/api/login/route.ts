import prisma from '@/lib/db'
import bcrypt from 'bcrypt'
import { createSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // lookup user
  const user = await prisma.user.findUnique({
    where: {
      username: body.username,
    },
  });
  if (!user) {
    return new NextResponse("Invalid Credentials", { status: 401 });
  }

  // compare passwords
  const match = await bcrypt.compare(body.password, user.passwordHash);
  if (!match) {
    return new NextResponse("Invalid Credentials", { status: 401 });
  }

  // create session cookies
  const payload = {
    id: user.id,
    role: user.role,
  };
  await createSession(payload);

  return new NextResponse(null, { status: 204 })
}