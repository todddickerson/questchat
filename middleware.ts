import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS for Whop iframe embedding
  const response = NextResponse.next();
  
  // Allow Whop domains to embed our app
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Check if request is from Whop
  const isWhopRequest = 
    origin?.includes('whop.com') || 
    referer?.includes('whop.com') ||
    request.headers.get('x-whop-user-id') !== null;
  
  if (isWhopRequest || process.env.NODE_ENV === 'development') {
    // Set CORS headers for Whop
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-whop-user-token, x-questchat-signature, X-Whop-User-ID, X-Whop-Signature');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // Allow iframe embedding from Whop
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://*.whop.com https://whop.com");
  } else {
    // Set basic CORS for non-Whop requests (API routes still need CORS)
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  // Log requests for debugging
  if (request.nextUrl.pathname.startsWith('/experiences/') || 
      request.nextUrl.pathname.startsWith('/api/')) {
    console.log('🔍 Request:', {
      path: request.nextUrl.pathname,
      method: request.method,
      isWhop: isWhopRequest,
      origin,
      referer,
      whopUserId: request.headers.get('x-whop-user-id'),
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match experience pages
    '/experiences/:path*',
  ],
};