import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization';

function parseAllowedOrigins(): string[] {
  const raw = process.env.CORS_ALLOWED_ORIGINS;
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getAllowedOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  if (!origin) {
    return null;
  }

  const allowedOrigins = parseAllowedOrigins();
  if (allowedOrigins.length === 0) {
    return null;
  }

  return allowedOrigins.includes(origin) ? origin : null;
}

export function applyCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = getAllowedOrigin(request);
  if (!origin) {
    return response;
  }

  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  response.headers.append('Vary', 'Origin');

  return response;
}

export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  const origin = getAllowedOrigin(request);
  if (!origin) {
    return new NextResponse(null, { status: 204 });
  }

  return applyCors(
    request,
    new NextResponse(null, {
      status: 204,
    }),
  );
}
