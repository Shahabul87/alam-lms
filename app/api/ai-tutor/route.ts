import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

// Anthropic API key from environment
// IMPORTANT: In production, always use environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_VERSION = '2023-06-01';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

// Create system prompt for tutor context
const createTutorSystemPrompt = (subject: string, learningStyle: string, userHistory: string) => {
  return `You are an AI tutor specializing in ${subject || 'various subjects'}. 
  
Your goal is to help the student learn effectively using their preferred learning style: ${learningStyle || 'adaptive to their needs'}.

Follow these principles:
1. Be encouraging, patient, and supportive
2. Use the Socratic method when appropriate - guide students to answers with questions
3. Provide clear, concise explanations with examples
4. Adapt to the student's level of understanding
5. Break down complex topics into manageable chunks
6. Connect new information to concepts the student already understands
7. Encourage critical thinking and problem-solving
8. Provide constructive feedback

Student learning history and progress: 
${userHistory || 'New student, no previous learning history available.'}

Remember that you are a tutor, not just an information provider. Your goal is to help the student truly understand and master the material.`;
};

export async function POST(req: NextRequest) {
  try {
    console.log("AI Tutor API: Request received");
    
    // Check if API key is available
    if (!ANTHROPIC_API_KEY) {
      console.error("AI Tutor API: No Anthropic API key found in environment variables");
      return new NextResponse('Server configuration error: API key not available', { status: 500 });
    }
    
    // For testing in development, skip authentication
    let user;
    try {
      user = await currentUser();
      if (!user) {
        console.log("AI Tutor API: No authenticated user found, using anonymous user for testing");
        user = { id: 'anonymous-user' };
      }
    } catch (error) {
      console.log("AI Tutor API: Error in authentication, using anonymous user", error);
      user = { id: 'anonymous-user' };
    }

    // Apply rate limiting - 50 requests per hour
    const identifier = user.id || user.email || 'anonymous-user';
    console.log(`AI Tutor API: Using identifier for rate limiting: ${identifier}`);
    
    let rateLimitResult;
    try {
      rateLimitResult = await rateLimit(identifier, 50);
    } catch (error) {
      console.error("AI Tutor API: Rate limiting error", error);
      rateLimitResult = { success: true, limit: 50, remaining: 49, reset: Date.now() + 3600000 };
    }
    
    const { success, limit, reset, remaining } = rateLimitResult;
    
    if (!success) {
      return new NextResponse('Too many requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }

    // Parse request body
    const reqBody = await req.json().catch(e => {
      console.error("AI Tutor API: Error parsing request body", e);
      return null;
    });
    
    if (!reqBody) {
      return new NextResponse('Invalid request: could not parse JSON body', { status: 400 });
    }
    
    const { messages, subject, learningStyle } = reqBody;

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse('Invalid request: messages array is required', { status: 400 });
    }

    console.log(`AI Tutor API: Processing request with subject: ${subject}, learningStyle: ${learningStyle}`);
    console.log(`AI Tutor API: Messages count: ${messages.length}`);

    // Generate system prompt
    const userHistory = ""; // This would come from a database in a real implementation
    const systemPrompt = createTutorSystemPrompt(subject, learningStyle, userHistory);

    // Format messages for Anthropic Claude API
    // NOTE: Anthropic requires system prompt as a top-level parameter, not in the messages array
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Logging the API call details (without sensitive data)
    console.log(`AI Tutor API: Calling Anthropic Claude API with ${formattedMessages.length} messages`);
    console.log("AI Tutor API: Using API key:", ANTHROPIC_API_KEY ? "API key is set" : "API key is NOT set");

    // Call Anthropic Claude API
    const apiUrl = 'https://api.anthropic.com/v1/messages';
    console.log(`AI Tutor API: Sending request to ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        system: systemPrompt, // Use system as a top-level parameter
        messages: formattedMessages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    console.log(`AI Tutor API: Claude API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Could not read error response");
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      
      console.error('AI Tutor API: Claude API error:', errorData);
      
      return new NextResponse(`Error from Claude API: ${JSON.stringify(errorData)}`, { 
        status: response.status 
      });
    }

    const data = await response.json();
    console.log("AI Tutor API: Successfully received response from Claude API");
    
    // Return the response in our standard format
    return NextResponse.json({
      id: data.id || Date.now().toString(),
      content: data.content?.[0]?.text || "No response from the AI tutor",
      role: 'assistant',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('AI Tutor API: Unhandled error:', error);
    console.error('AI Tutor API: Error stack:', error.stack);
    return new NextResponse(`Error: ${error.message}\nStack: ${error.stack}`, { status: 500 });
  }
} 