import { NextRequest, NextResponse } from "next/server";
import { authenticateDynamicRoute } from "@/lib/auth-dynamic";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log("[TEST_COURSE_ROUTE] Testing course route pattern");
    
    const user = await authenticateDynamicRoute(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Authentication failed",
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Course route pattern works!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("[TEST_COURSE_ROUTE] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("[TEST_COURSE_ROUTE] Testing PATCH method");
    
    const user = await authenticateDynamicRoute(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Authentication failed",
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: "PATCH method works with authentication!",
      user: {
        id: user.id,
        email: user.email
      },
      receivedData: body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("[TEST_COURSE_ROUTE] PATCH Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 