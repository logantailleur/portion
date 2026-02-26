import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Sets x-pathname so server layouts can avoid redirect loops
 * (e.g. onboarding redirect only when not already on /onboarding).
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}
