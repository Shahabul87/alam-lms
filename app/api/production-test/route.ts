import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: {} as Record<string, any>
  };

  // Test 1: Environment Variables
  try {
    testResults.tests.environmentVariables = {
      status: 'success',
      data: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        hasRequiredEnvVars: !!(process.env.DATABASE_URL && process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL)
      }
    };
  } catch (error) {
    testResults.tests.environmentVariables = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Test 2: Database Connection
  try {
    const courseCount = await db.course.count();
    const userCount = await db.user.count();
    
    testResults.tests.databaseConnection = {
      status: 'success',
      data: {
        connected: true,
        courseCount,
        userCount,
        canRead: true
      }
    };
  } catch (error) {
    testResults.tests.databaseConnection = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      connected: false
    };
  }

  // Test 3: Authentication System
  try {
    const user = await currentUser();
    testResults.tests.authentication = {
      status: 'success',
      data: {
        authSystemWorking: true,
        userAuthenticated: !!user,
        userId: user?.id || null,
        userEmail: user?.email || null
      }
    };
  } catch (error) {
    testResults.tests.authentication = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      authSystemWorking: false
    };
  }

  // Test 4: Database Write Operation (Safe test)
  try {
    // Try to create and immediately delete a test record
    const testCourse = await db.course.create({
      data: {
        title: 'TEST_COURSE_DELETE_ME',
        userId: 'test-user-id',
        description: 'This is a test course that should be deleted immediately'
      }
    });

    await db.course.delete({
      where: { id: testCourse.id }
    });

    testResults.tests.databaseWrite = {
      status: 'success',
      data: {
        canWrite: true,
        canDelete: true,
        testCourseId: testCourse.id
      }
    };
  } catch (error) {
    testResults.tests.databaseWrite = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      canWrite: false
    };
  }

  // Test 5: Request Headers and CORS
  try {
    const headers = {
      origin: req.headers.get('origin'),
      host: req.headers.get('host'),
      userAgent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
      authorization: req.headers.get('authorization') ? 'Present' : 'Not present'
    };

    testResults.tests.requestHeaders = {
      status: 'success',
      data: headers
    };
  } catch (error) {
    testResults.tests.requestHeaders = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Calculate overall status
  const failedTests = Object.values(testResults.tests).filter(test => test.status === 'error');
  const overallStatus = failedTests.length === 0 ? 'success' : 'partial_failure';

  const response = NextResponse.json({
    ...testResults,
    overallStatus,
    failedTestsCount: failedTests.length,
    totalTestsCount: Object.keys(testResults.tests).length,
    summary: {
      allTestsPassed: failedTests.length === 0,
      criticalIssues: failedTests.filter(test => 
        test.error?.includes('DATABASE_URL') || 
        test.error?.includes('NEXTAUTH_SECRET') ||
        test.error?.includes('connect')
      ).length > 0
    }
  });

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 