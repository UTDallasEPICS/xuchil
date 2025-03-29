import prisma from '@/lib/db'
import bcrypt from 'bcrypt'
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (!user) {
    return new Response("Invalid Credentials", {
      status: 401,
    });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return new Response("Invalid Credentials", {
      status: 401
    });
  }

  const payload = {
    id: user.id,
    role: user.role,
  };
  await createSession(payload);
}