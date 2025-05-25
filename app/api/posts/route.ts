import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(
  req: Request,
) {
  try {
    // Authenticate the user
    const user = await currentUser();
    
    if (!user?.id) {
      return new NextResponse(JSON.stringify({ 
        success: false,
        error: "Unauthorized"
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse the request body
    const body = await req.json();
    const { title, categories } = body;
    
    if (!title) {
      return new NextResponse(JSON.stringify({ 
        success: false,
        error: "Title is required" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Prepare category string if categories are provided
    const categoryString = categories && Array.isArray(categories) && categories.length > 0 
      ? categories.join(', ')
      : null;
    
    // Create the post in the database
    const post = await db.post.create({
      data: {
        userId: user.id,
        title: title.trim(),
        category: categoryString,
      }
    });
    
    // Return a simple response with just the ID and success status
    return new NextResponse(JSON.stringify({
      success: true,
      id: post.id
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("[POSTS] Error:", error);
    
    return new NextResponse(JSON.stringify({ 
      success: false,
      error: "Internal Server Error"
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}