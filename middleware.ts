import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  isPublicRoute,
  isProtectedRoute,
} from "@/routes";

// Middleware-specific auth config without Credentials provider
// to avoid bcryptjs Edge Runtime issues
const middlewareAuthConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    // Note: Credentials provider is excluded to avoid bcryptjs in Edge Runtime
  ],
};

const { auth } = NextAuth(middlewareAuthConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Skip middleware for static files and Next.js internals
  const isNextStaticRoute = pathname.startsWith('/_next/') || 
                           pathname.startsWith('/favicon.ico') ||
                           pathname.includes('.');
  
  if (isNextStaticRoute) {
    return;
  }

  // Skip middleware for API auth routes
  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  if (isApiAuthRoute) {
    return;
  }

  // Check if it's an auth route (login, register, etc.)
  const isAuthRoute = authRoutes.includes(pathname);
  
  // Check if it's a public route using the improved function
  const isPublic = isPublicRoute(pathname);
  
  // Check if it's a protected route using the improved function
  const isProtected = isProtectedRoute(pathname);

  // Debug logging for dynamic routes (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MIDDLEWARE] ${pathname} - Public: ${isPublic}, Protected: ${isProtected}, LoggedIn: ${isLoggedIn}`);
  }

  // Handle auth routes
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  // Handle protected routes
  if (isProtected && !isLoggedIn) {
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

  // Handle non-public routes that aren't explicitly protected
  if (!isPublic && !isProtected && !isLoggedIn) {
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

  return;
});

// Update the matcher to be more specific and exclude static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.css$|.*\\.js$).*)',
  ],
};