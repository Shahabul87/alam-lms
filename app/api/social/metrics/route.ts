import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    console.log("Social metrics API called");
    
    // Get current user
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log("No authenticated user found");
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    console.log(`Requesting metrics for user ID: ${session.user.id}`);
    
    // Check if user has connected accounts
    const facebookAccount = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook'
      }
    });
    
    if (!facebookAccount) {
      console.log("No Facebook account found for user");
      return NextResponse.json({ 
        error: "No connected Facebook account found",
        shouldConnect: true 
      }, { status: 404 });
    }
    
    console.log("Facebook account found, forwarding to Facebook metrics API");
    
    try {
      // Forward the request to the appropriate endpoint
      // Fetch data from Facebook metrics API internally
      // Get the base URL from the request
      const origin = req.headers.get('host') || 'localhost:3000';
      const protocol = origin.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${origin}`;
      
      // Construct the absolute URL
      const facebookMetricsUrl = `${baseUrl}/api/social/facebook/metrics`;
      
      // Make the request
      const response = await fetch(facebookMetricsUrl);
      
      if (!response.ok) {
        console.log(`Error response from Facebook metrics API: ${response.status}`);
        const errorText = await response.text();
        console.log(`Error details: ${errorText}`);
        return NextResponse.json({ 
          error: `Failed to fetch Facebook metrics (${response.status})`,
          details: errorText
        }, { status: response.status });
      }
      
      // Return the response
      const data = await response.json();
      console.log("Successfully retrieved Facebook metrics");
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Error fetching from Facebook metrics API:", fetchError);
      return NextResponse.json({ 
        error: "Error communicating with Facebook API service",
        details: fetchError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API error in social metrics route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message }, 
      { status: 500 }
    );
  }
} 