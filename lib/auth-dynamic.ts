import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { db } from "@/lib/db";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

/**
 * Robust authentication for dynamic API routes in Next.js 15
 * This bypasses NextAuth's auth() function which can fail in dynamic routes
 */
export async function authenticateApiRoute(request?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    console.log("[AUTH_DYNAMIC] Starting authentication process");
    
    // Method 1: Try to get session token from cookies
    const cookieStore = await cookies();
    
    // NextAuth typically stores the session token in these cookie names
    const sessionTokenNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'authjs.session-token',
      '__Secure-authjs.session-token'
    ];
    
    let sessionToken: string | undefined;
    
    for (const tokenName of sessionTokenNames) {
      const token = cookieStore.get(tokenName);
      if (token?.value) {
        sessionToken = token.value;
        console.log("[AUTH_DYNAMIC] Found session token:", tokenName);
        break;
      }
    }
    
    // Method 2: Try to get from Authorization header if no cookie
    if (!sessionToken && request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7);
        console.log("[AUTH_DYNAMIC] Found token in Authorization header");
      }
    }
    
    if (!sessionToken) {
      console.log("[AUTH_DYNAMIC] No session token found");
      return null;
    }
    
    // Decode the JWT token
    const decoded = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    
    if (!decoded || !decoded.sub) {
      console.log("[AUTH_DYNAMIC] Invalid or expired token");
      return null;
    }
    
    console.log("[AUTH_DYNAMIC] Token decoded successfully, user ID:", decoded.sub);
    
    // Get user from database to ensure they still exist and are active
    const user = await db.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      }
    });
    
    if (!user) {
      console.log("[AUTH_DYNAMIC] User not found in database");
      return null;
    }
    
    if (!user.emailVerified) {
      console.log("[AUTH_DYNAMIC] User email not verified");
      return null;
    }
    
    console.log("[AUTH_DYNAMIC] Authentication successful for user:", user.id);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    };
    
  } catch (error) {
    console.error("[AUTH_DYNAMIC] Authentication error:", error);
    return null;
  }
}

/**
 * Alternative authentication method using direct database lookup
 * Fallback when JWT decoding fails
 */
export async function authenticateBySession(): Promise<AuthenticatedUser | null> {
  try {
    console.log("[AUTH_SESSION] Attempting session-based authentication");
    
    const cookieStore = await cookies();
    
    // Look for session ID in cookies
    const sessionId = cookieStore.get('next-auth.session-token')?.value ||
                     cookieStore.get('__Secure-next-auth.session-token')?.value;
    
    if (!sessionId) {
      console.log("[AUTH_SESSION] No session ID found");
      return null;
    }
    
    // Query the session table directly
    const session = await db.session.findUnique({
      where: { sessionToken: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
          }
        }
      }
    });
    
    if (!session || !session.user) {
      console.log("[AUTH_SESSION] Session not found or invalid");
      return null;
    }
    
    // Check if session is expired
    if (session.expires < new Date()) {
      console.log("[AUTH_SESSION] Session expired");
      return null;
    }
    
    if (!session.user.emailVerified) {
      console.log("[AUTH_SESSION] User email not verified");
      return null;
    }
    
    console.log("[AUTH_SESSION] Session authentication successful for user:", session.user.id);
    
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
      role: session.user.role,
    };
    
  } catch (error) {
    console.error("[AUTH_SESSION] Session authentication error:", error);
    return null;
  }
}

/**
 * Main authentication function that tries multiple methods
 */
export async function authenticateDynamicRoute(request?: NextRequest): Promise<AuthenticatedUser | null> {
  console.log("[AUTH_MAIN] Starting dynamic route authentication");
  
  // Try JWT-based authentication first
  let user = await authenticateApiRoute(request);
  
  // If JWT fails, try session-based authentication
  if (!user) {
    console.log("[AUTH_MAIN] JWT auth failed, trying session auth");
    user = await authenticateBySession();
  }
  
  if (user) {
    console.log("[AUTH_MAIN] Authentication successful for user:", user.id);
  } else {
    console.log("[AUTH_MAIN] Authentication failed - no valid session found");
  }
  
  return user;
} 