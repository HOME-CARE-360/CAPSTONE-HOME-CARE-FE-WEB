import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt, isServiceProvider, isCustomer, isManager, isAdmin, isStaff } from './utils/jwt';

// Define routes that require authentication
const protectedRoutes = [
  '/provider/dashboard',
  '/provider',
  '/user/profile',
  '/settings/profile',
  '/manager',
  '/admin',
  '/admin/manage-user',
  // Add other protected routes as needed
];

// Define routes that should be redirected to dashboard if user is logged in
const authRoutes = ['/login', '/register', '/forgot-password'];

// Define provider-only routes
const providerRoutes = ['/provider', '/provider/dashboard'];

// Define customer-only protected routes (not public)
const customerProtectedRoutes = ['/user/profile'];

const managerProtectedRoutes = ['/manager', '/manager/manage-category'];

const staffProtectedRoutes = ['/staff', '/staff/dashboard', '/staff/bookings'];

const adminProtectedRoutes = ['/admin', '/admin/manage-user'];

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

  // Check if the route is a provider route
  const isProviderRoute = providerRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isManagerRoute = managerProtectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAdminRoute = adminProtectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the route is a protected customer route
  const isCustomerProtectedRoute = customerProtectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isStaffRoute = staffProtectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If the route requires authentication and user is not logged in
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is logged in and tries to access auth routes, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If token exists, decode it and check role-based access
  if (token) {
    try {
      const decodedToken = decodeJwt(token);

      if (decodedToken) {
        // Handle provider routes - only allow service providers
        if (isProviderRoute && !isServiceProvider(decodedToken)) {
          return NextResponse.redirect(new URL('/', request.url));
        }

        // Handle protected customer routes - only allow customers
        if (isCustomerProtectedRoute && !isCustomer(decodedToken)) {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (isManagerRoute && !isManager(decodedToken)) {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (isStaffRoute && !isStaff(decodedToken)) {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (isAdminRoute && !isAdmin(decodedToken)) {
          return NextResponse.redirect(new URL('/', request.url));
        }

        // Redirect to appropriate dashboard based on role when accessing root
        if (pathname === '/') {
          if (isServiceProvider(decodedToken)) {
            return NextResponse.redirect(new URL('/provider/dashboard', request.url));
          }
          if (isStaff(decodedToken)) {
            return NextResponse.redirect(new URL('/staff/dashboard', request.url));
          }
          if (isManager(decodedToken)) {
            return NextResponse.redirect(new URL('/manager/manage-category', request.url));
          }
          if (isAdmin(decodedToken)) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
          }
        }
      }
    } catch (error) {
      console.error('[AUTH] Error processing token:', error);
      // If there's an error with the token, treat user as not authenticated
      if (isProtectedRoute) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
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
