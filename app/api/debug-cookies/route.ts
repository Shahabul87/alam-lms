import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log("[DEBUG_COOKIES] Starting cookie debug");
    
    // Get all cookies
    const cookieStore = await cookies();
    const allCookies: Record<string, string> = {};
    
    cookieStore.getAll().forEach(cookie => {
      allCookies[cookie.name] = cookie.value;
    });
    
    console.log("[DEBUG_COOKIES] All cookies:", Object.keys(allCookies));
    
    // Try the original auth function
    let originalAuthResult = null;
    try {
      const session = await auth();
      originalAuthResult = session ? {
        hasSession: true,
        userId: session.user?.id,
        userEmail: session.user?.email
      } : { hasSession: false };
    } catch (authError) {
      originalAuthResult = { error: authError instanceof Error ? authError.message : "Auth failed" };
    }
    
    return NextResponse.json({
      cookies: allCookies,
      cookieNames: Object.keys(allCookies),
      originalAuth: originalAuthResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("[DEBUG_COOKIES] Error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 