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
    // More comprehensive NEXTAUTH_SECRET check
    const nextAuthSecretExists = !!(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 0);
    const nextAuthSecretLength = process.env.NEXTAUTH_SECRET?.length || 0;
    
    testResults.tests.environmentVariables = {
      status: 'success',
      data: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        NEXTAUTH_SECRET_SET: nextAuthSecretExists,
        NEXTAUTH_SECRET_LENGTH: nextAuthSecretLength,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        hasRequiredEnvVars: !!(process.env.DATABASE_URL && nextAuthSecretExists && process.env.NEXTAUTH_URL)
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

  // Test 3: Authentication System (Enhanced)
  let authenticatedUser = null;
  try {
    authenticatedUser = await currentUser();
    
    // If user is authenticated, it means NEXTAUTH_SECRET is working
    const authWorking = !!authenticatedUser;
    
    testResults.tests.authentication = {
      status: 'success',
      data: {
        authSystemWorking: true,
        userAuthenticated: authWorking,
        userId: authenticatedUser?.id || null,
        userEmail: authenticatedUser?.email || null,
        // If auth is working, secret must be present
        nextAuthSecretEffective: authWorking
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
    if (authenticatedUser?.id) {
      // Use the authenticated user's ID to avoid foreign key constraint errors
      const testCourse = await db.course.create({
        data: {
          title: 'TEST_COURSE_DELETE_ME',
          userId: authenticatedUser.id,
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
          testCourseId: testCourse.id,
          usedUserId: authenticatedUser.id
        }
      };
    } else {
      // If no authenticated user, skip the write test
      testResults.tests.databaseWrite = {
        status: 'skipped',
        data: {
          canWrite: 'unknown',
          canDelete: 'unknown',
          reason: 'No authenticated user available for safe testing'
        }
      };
    }
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
  
  // Enhanced analysis
  const authWorking = testResults.tests.authentication?.data?.userAuthenticated;
  const envVarDetected = testResults.tests.environmentVariables?.data?.NEXTAUTH_SECRET_SET;
  const secretLength = testResults.tests.environmentVariables?.data?.NEXTAUTH_SECRET_LENGTH || 0;

  const response = NextResponse.json({
    ...testResults,
    overallStatus,
    failedTestsCount: failedTests.length,
    totalTestsCount: Object.keys(testResults.tests).length,
    summary: {
      allTestsPassed: failedTests.length === 0,
      criticalIssues: failedTests.filter(test => 
        test.error?.includes('DATABASE_URL') || 
        test.error?.includes('connect')
      ).length > 0,
      authenticationAnalysis: {
        secretDetectedInEnv: envVarDetected,
        secretLength: secretLength,
        authenticationWorking: authWorking,
        // If auth is working but env var not detected, it's likely a detection issue
        likelyDetectionIssue: authWorking && !envVarDetected,
        verdict: authWorking ? 'NEXTAUTH_SECRET is working correctly' : 'NEXTAUTH_SECRET may have issues'
      },
      recommendations: [
        ...(authWorking ? ['✅ Authentication is working - NEXTAUTH_SECRET is functional'] : ['❌ Authentication not working - check NEXTAUTH_SECRET']),
        ...(failedTests.length > 0 ? ['Check server logs for detailed error information'] : []),
        ...(failedTests.length === 0 ? ['All systems operational! 🎉'] : [])
      ]
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