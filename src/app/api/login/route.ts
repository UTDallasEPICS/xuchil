import prisma from '@/lib/db'
import bcrypt from 'bcrypt'
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  const body = await request.json();

  // lookup user
  const user = await prisma.user.findUnique({
    where: {
      username: body.username,
    },
  });
  if (!user) {
    return new Response("Invalid Credentials", { status: 401 });
  }

  // compare passwords
  const match = await bcrypt.compare(body.password, user.passwordHash);
  if (!match) {
    return new Response("Invalid Credentials", { status: 401 });
  }

  // create session cookies
  const payload = {
    id: user.id,
    role: user.role,
  };
  await createSession(payload);
}