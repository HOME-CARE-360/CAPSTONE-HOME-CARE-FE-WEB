import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

type BackendRefreshResponse = {
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      refreshToken?: string;
    };

    const cookieStore = cookies();
    const cookieRefreshToken = cookieStore.get('refresh-token')?.value;
    const refreshToken = body?.refreshToken || cookieRefreshToken;

    if (!refreshToken) {
      const res = NextResponse.json({ message: 'Missing refresh token' }, { status: 401 });
      // Clear potentially stale cookies
      res.cookies.set('auth-token', '', { path: '/', maxAge: 0, httpOnly: false });
      res.cookies.set('refresh-token', '', { path: '/', maxAge: 0, httpOnly: false });
      res.cookies.set('userId', '', { path: '/', maxAge: 0, httpOnly: false });
      return res;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL_BACKEND;
    if (!backendUrl) {
      return NextResponse.json({ message: 'Backend URL is not configured' }, { status: 500 });
    }

    const backendResponse = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      // Ensure credentials are not auto-attached; backend expects only body
    });

    if (!backendResponse.ok) {
      const res = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      // Clear all relevant cookies when refresh is defective
      res.cookies.set('auth-token', '', { path: '/', maxAge: 0, httpOnly: false });
      res.cookies.set('refresh-token', '', { path: '/', maxAge: 0, httpOnly: false });
      res.cookies.set('userId', '', { path: '/', maxAge: 0, httpOnly: false });
      return res;
    }

    const data = (await backendResponse.json()) as BackendRefreshResponse;
    const accessToken = data?.data?.accessToken;
    const newRefreshToken = data?.data?.refreshToken;

    if (!accessToken || !newRefreshToken) {
      const res = NextResponse.json(
        { message: 'Invalid response from auth service' },
        { status: 401 }
      );
      res.cookies.set('auth-token', '', { path: '/', maxAge: 0, httpOnly: false });
      res.cookies.set('refresh-token', '', { path: '/', maxAge: 0, httpOnly: false });
      res.cookies.set('userId', '', { path: '/', maxAge: 0, httpOnly: false });
      return res;
    }

    const res = NextResponse.json(
      { message: 'Token refreshed', data: { accessToken, refreshToken: newRefreshToken } },
      { status: 200 }
    );

    // Align cookie semantics with existing client-side cookies (non-HttpOnly)
    const oneDay = 60 * 60 * 24;
    res.cookies.set('auth-token', accessToken, {
      path: '/',
      maxAge: oneDay,
      httpOnly: false,
    });
    res.cookies.set('refresh-token', newRefreshToken, {
      path: '/',
      maxAge: oneDay,
      httpOnly: false,
    });

    return res;
  } catch (error) {
    const res = NextResponse.json(
      { message: error instanceof Error ? error.message : 'Refresh error' },
      { status: 500 }
    );
    // On unexpected errors, also clear cookies to force re-auth
    res.cookies.set('auth-token', '', { path: '/', maxAge: 0, httpOnly: false });
    res.cookies.set('refresh-token', '', { path: '/', maxAge: 0, httpOnly: false });
    res.cookies.set('userId', '', { path: '/', maxAge: 0, httpOnly: false });
    return res;
  }
}
