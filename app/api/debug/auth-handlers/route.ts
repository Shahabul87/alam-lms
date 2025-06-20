import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if we can import the auth handlers
    let handlersStatus = 'UNKNOWN';
    let authStatus = 'UNKNOWN';
    let configStatus = 'UNKNOWN';
    
    try {
      const { GET: authGET, POST: authPOST } = await import('@/auth');
      handlersStatus = (authGET && authPOST) ? 'AVAILABLE' : 'PARTIAL';
    } catch (error) {
      handlersStatus = `ERROR: ${error instanceof Error ? error.message : 'Unknown'}`;
    }

    try {
      const { auth } = await import('@/auth');
      authStatus = auth ? 'AVAILABLE' : 'MISSING';
    } catch (error) {
      authStatus = `ERROR: ${error instanceof Error ? error.message : 'Unknown'}`;
    }

    try {
      const authConfig = await import('@/auth.config');
      configStatus = authConfig.default ? 'AVAILABLE' : 'MISSING';
    } catch (error) {
      configStatus = `ERROR: ${error instanceof Error ? error.message : 'Unknown'}`;
    }

    // Test if the NextAuth route file exists and is properly configured
    let routeFileStatus = 'UNKNOWN';
    try {
      const routeHandlers = await import('@/app/api/auth/[...nextauth]/route');
      routeFileStatus = (routeHandlers.GET && routeHandlers.POST) ? 'AVAILABLE' : 'PARTIAL';
    } catch (error) {
      routeFileStatus = `ERROR: ${error instanceof Error ? error.message : 'Unknown'}`;
    }

    return NextResponse.json({
      status: 'NextAuth Handlers Test',
      timestamp: new Date().toISOString(),
      tests: {
        authHandlers: handlersStatus,
        authFunction: authStatus,
        authConfig: configStatus,
        routeFile: routeFileStatus,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        runtime: process.env.VERCEL_FUNCTION_REGION || 'unknown',
      },
      recommendations: [
        handlersStatus.includes('ERROR') && 'Check auth.ts file for export issues',
        authStatus.includes('ERROR') && 'Check auth function export',
        configStatus.includes('ERROR') && 'Check auth.config.ts file',
        routeFileStatus.includes('ERROR') && 'Check /api/auth/[...nextauth]/route.ts file',
      ].filter(Boolean)
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Auth handlers test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 