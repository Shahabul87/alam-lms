import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  getRedirectUrl,
} from "@/routes";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// Enhanced middleware that handles both auth and CORS
export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isLoggedIn = !!req.auth;

  // Handle CORS for API routes FIRST
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Add CORS headers for all API routes
    const allowedOrigins = ['http://localhost:3000', 'https://bdgenai.com'];
    const origin = req.headers.get('origin') ?? allowedOrigins[0];
    const isAllowedOrigin = allowedOrigins.includes(origin);
    
    response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200,
        headers: response.headers,
      });
    }

    // For API routes, continue with the response (don't block authenticated API calls)
    return response;
  }

  // Allow search API routes to bypass auth completely
  if (pathname.startsWith('/api/search')) {
    return NextResponse.next();
  }

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.some(route => {
    // Convert route to regex pattern
    const pattern = new RegExp(`^${route.replace(/\[.*?\]/g, '[^/]+')}$`);
    return pattern.test(pathname);
  });
  const isAuthRoute = authRoutes.includes(pathname);

  if (isApiAuthRoute) {
    return undefined;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      const role = req.auth?.user?.role;
      const redirectPath = getRedirectUrl(role);
      return Response.redirect(new URL(redirectPath, nextUrl))
    }
    return undefined;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(new URL(
      `/auth/login?callbackUrl=${encodedCallbackUrl}`,
      nextUrl
    ));
  }

  return undefined;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};