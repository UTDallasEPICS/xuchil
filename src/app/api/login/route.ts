import prisma from '@/lib/db'
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;
  // TODO implement user verification and retrieval
  const payload = {
    userId: 0,
    role: '',
  }
  await createSession(payload);
}