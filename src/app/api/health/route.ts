import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const checks = {
    sessionSecretConfigured: Boolean(process.env.SESSION_SECRET),
    database: 'unknown' as 'ok' | 'error' | 'unknown',
    corsOriginsConfigured: Boolean(process.env.CORS_ALLOWED_ORIGINS?.trim()),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    deploymentModel: 'same-origin' as const,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  return NextResponse.json(checks);
}
