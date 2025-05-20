import { NextRequest, NextResponse } from 'next/server';

// Define routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/property',
  // Add other protected routes as needed
];

// Define routes that should be redirected to dashboard if user is logged in
const authRoutes = ['/login', '/register', '/forgot-password'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check both cookie and localStorage-based storage
  // Note: Since middleware runs on the server, we need to access the client-stored
  // token via cookies. This requires changes to how we store tokens.
  const token = request.cookies.get('auth-token')?.value;

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the route is an auth route (login, register, etc.)
  const isAuthRoute = authRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If the route requires authentication and user is not logged in
  if (isProtectedRoute && !token) {
    console.log('[AUTH] Redirecting to login, no valid token found');
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is logged in and tries to access auth routes, redirect to dashboard
  if (isAuthRoute && token) {
    console.log('[AUTH] Redirecting to dashboard, user already logged in');
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts|assets).*)',
  ],
};
