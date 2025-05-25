import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
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

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  // Add explicit check for _next/static and _next/image routes
  const isNextStaticRoute = nextUrl.pathname.startsWith('/_next/static') || 
                           nextUrl.pathname.startsWith('/_next/image');
  
     if (isNextStaticRoute) {
     return;
   }
  
  const isPublicRoute = publicRoutes.some(route => {
    // Convert route to regex pattern
    const pattern = new RegExp(`^${route.replace(/\[.*?\]/g, '[^/]+')}$`);
    return pattern.test(nextUrl.pathname);
  });
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

     // Special handling for API routes
   if (isApiAuthRoute) {
     return;
   }

   if (isAuthRoute) {
     if (isLoggedIn) {
       return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
     }
     return;
   }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
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
})

// Update the matcher to exclude static files and images
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
    '/',
  ],
}