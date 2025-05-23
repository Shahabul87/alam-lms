import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing DeepSeek AI Tutor integration...');
    
    // Prepare the test data
    const testData = {
      messages: [
        {
          role: 'user',
          content: 'What is photosynthesis? Please explain in a way that helps visual learners.'
        }
      ],
      subject: 'Biology',
      learningStyle: 'visual'
    };
    
    // Call our AI tutor API
    const response = await fetch(`${req.nextUrl.origin}/api/ai-tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the test results
    return NextResponse.json({
      status: 'success',
      message: 'DeepSeek AI Tutor integration test successful',
      request: testData,
      response: data
    });
  } catch (error: any) {
    console.error('Test failed with error:', error.message);
    
    return NextResponse.json({
      status: 'error',
      message: `Test failed: ${error.message}`,
    }, { status: 500 });
  }
} 