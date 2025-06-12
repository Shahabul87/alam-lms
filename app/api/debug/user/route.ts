import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await auth();
    
    // Check if in development mode or user is admin
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isAdmin = session?.user?.role === 'ADMIN';
    
    // In production, only allow admins to access this endpoint
    if (!isDevelopment && !isAdmin) {
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: 'Debug endpoint only available in development or for admins' 
        }, 
        { status: 403 }
      );
    }

    // Collect debug information
    const debugData: any = {
      environment: {
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        debugMode: isDevelopment ? 'development' : 'production-admin'
      },
      session: null,
      user: null,
      profileLinks: [],
      socialMediaAccounts: [],
      error: null
    };

    // Session information
    if (session) {
      debugData.session = {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          image: session.user?.image,
          role: session.user?.role,
          emailVerified: session.user?.emailVerified,
          isTwoFactorEnabled: session.user?.isTwoFactorEnabled,
          isOAuth: session.user?.isOAuth
        },
        expires: session.expires
      };

      // Get comprehensive user data from database
      if (session.user?.id) {
        try {
          const userData = await db.user.findUnique({
            where: { id: session.user.id },
            include: {
              accounts: {
                select: {
                  id: true,
                  type: true,
                  provider: true,
                  providerAccountId: true,
                  scope: true,
                  token_type: true,
                  userId: true,
                  refresh_token: true,
                  access_token: true,
                  expires_at: true,
                  id_token: true,
                  session_state: true
                }
              },
              profileLinks: {
                orderBy: { createdAt: 'desc' }
              },
              socialMediaAccounts: {
                select: {
                  id: true,
                  platform: true,
                  username: true,
                  displayName: true,
                  profileUrl: true,
                  followerCount: true,
                  followingCount: true,
                  postsCount: true,
                  isActive: true,
                  lastSyncAt: true,
                  createdAt: true
                }
              },
              posts: {
                select: {
                  id: true,
                  title: true,
                  createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 5
              },
              comments: {
                select: {
                  id: true,
                  content: true,
                  createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 5
              },
              courses: {
                select: {
                  id: true,
                  title: true,
                  createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 5
              },
              ideas: {
                select: {
                  id: true,
                  title: true,
                  createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                take: 5
              }
            }
          });

          if (userData) {
            debugData.user = {
              basic: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                image: userData.image,
                phone: userData.phone,
                role: userData.role,
                emailVerified: userData.emailVerified,
                isTwoFactorEnabled: userData.isTwoFactorEnabled,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt
              },
              accounts: userData.accounts,
              profileLinks: userData.profileLinks,
              socialMediaAccounts: userData.socialMediaAccounts,
              recentPosts: userData.posts,
              recentComments: userData.comments,
              recentCourses: userData.courses,
              recentIdeas: userData.ideas,
              counts: {
                posts: userData.posts.length,
                comments: userData.comments.length,
                courses: userData.courses.length,
                ideas: userData.ideas.length,
                profileLinks: userData.profileLinks.length,
                socialAccounts: userData.socialMediaAccounts.length,
                connectedProviders: userData.accounts.length
              }
            };

            debugData.profileLinks = userData.profileLinks;
            debugData.socialMediaAccounts = userData.socialMediaAccounts;
          } else {
            debugData.error = 'User not found in database';
          }

        } catch (dbError) {
          debugData.error = `Database error: ${dbError.message}`;
          console.error('Debug API database error:', dbError);
        }
      }
    } else {
      debugData.session = null;
      debugData.error = 'No active session';
    }

    // Additional debug info
    debugData.requestInfo = {
      url: request.url,
      method: request.method,
      headers: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        origin: request.headers.get('origin')
      }
    };

    // Database connection check
    try {
      await db.$queryRaw`SELECT 1`;
      debugData.database = { status: 'connected' };
    } catch (dbError) {
      debugData.database = { 
        status: 'error', 
        error: dbError.message 
      };
    }

    return NextResponse.json(debugData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        environment: process.env.NODE_ENV 
      }, 
      { status: 500 }
    );
  }
}

// POST endpoint for testing data modifications
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isAdmin = session?.user?.role === 'ADMIN';
    
    if (!isDevelopment && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 403 }
      );
    }

    const { action, data } = await request.json();

    const result: any = {
      action,
      timestamp: new Date().toISOString(),
      success: false,
      result: null,
      error: null
    };

    if (!session?.user?.id) {
      result.error = 'No user session';
      return NextResponse.json(result, { status: 401 });
    }

    switch (action) {
      case 'refresh-session':
        // Force session refresh by returning current session
        const currentSession = await auth();
        result.success = true;
        result.result = currentSession;
        break;

      case 'test-profile-link':
        // Test adding a profile link
        if (data?.platform && data?.url) {
          const profileLink = await db.profileLink.create({
            data: {
              platform: data.platform,
              url: data.url,
              userId: session.user.id
            }
          });
          result.success = true;
          result.result = profileLink;
        } else {
          result.error = 'Missing platform or url in data';
        }
        break;

      case 'clear-profile-links':
        // Clear all profile links (development only)
        if (isDevelopment) {
          const deleted = await db.profileLink.deleteMany({
            where: { userId: session.user.id }
          });
          result.success = true;
          result.result = { deletedCount: deleted.count };
        } else {
          result.error = 'Clear action only available in development';
        }
        break;

      default:
        result.error = `Unknown action: ${action}`;
    }

    return NextResponse.json(result, { status: result.success ? 200 : 400 });

  } catch (error) {
    console.error('Debug API POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      }, 
      { status: 500 }
    );
  }
} 