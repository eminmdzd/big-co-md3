import { NextResponse } from 'next/server';

// This middleware adds CORS headers to all responses
export function middleware() {
  // Create a new response
  const response = NextResponse.next();

  // Add CORS headers to the response
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// Specify which paths this middleware should run on
export const config = {
  matcher: '/:path*',
};
EOF < /dev/null