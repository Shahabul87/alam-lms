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

// Custom middleware function that adds CORS headers for API routes
const addCorsHeaders = (request: NextRequest) => {
  const response = NextResponse.next();
  
  // Add CORS headers only to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200,
        headers: response.headers,
      });
    }
  }
  
  return response;
};

// Auth.js middleware enhanced with CORS support
export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isLoggedIn = !!req.auth;

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

// Add a chained middleware to handle CORS for all routes
export const middleware = (request: NextRequest) => {
  // Only apply CORS headers to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return addCorsHeaders(request);
  }
  
  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};