import { NextRequest, NextResponse } from 'next/server';

// Mock response generator to simulate AI responses
function generateMockResponse(query: string, subject: string, learningStyle: string): string {
  // Simple mock responses based on input
  if (query.toLowerCase().includes('photosynthesis')) {
    if (learningStyle === 'visual') {
      return `
# Photosynthesis Explained (Visual Style)

Imagine the plant as a factory:

🌞 **Sunlight** → Energy source (like electricity powering a factory)
🌱 **Chloroplasts** → Solar panels that capture this energy
💧 **Water** (H₂O) → Raw material #1, absorbed through roots
🌬️ **Carbon Dioxide** (CO₂) → Raw material #2, absorbed from air

Inside the "factory":
1. Sunlight energy is captured by chlorophyll (green pigment)
2. Water molecules are split apart
3. Carbon dioxide is processed
4. These components are rearranged to create:
   - Glucose (sugar) → Plant's food/energy storage
   - Oxygen → Released into air as waste product

Visual diagram:
\`\`\`
Sunlight
   |
   v
CO₂ + H₂O → [PLANT CHLOROPLASTS] → Glucose (C₆H₁₂O₆) + O₂
                     |                       |
                     v                       v
                 Chlorophyll          Plant uses for energy
\`\`\`

This process is happening constantly in all green parts of plants, turning light energy into chemical energy that powers all plant growth!
`;
    } else {
      // Default response for other learning styles
      return "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. During photosynthesis, plants take in carbon dioxide and water, and using the energy from sunlight, convert these into glucose and oxygen.";
    }
  }
  
  return `I'm a mock AI tutor focusing on ${subject || 'general topics'}. You asked: "${query}" and prefer a ${learningStyle || 'balanced'} learning style. In a real implementation, I would provide a customized response based on these parameters.`;
}

export async function POST(req: NextRequest) {
  try {
    // Simulate server processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Parse request body
    const { messages, subject, learningStyle } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new NextResponse('Invalid request: messages array is required', { status: 400 });
    }
    
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userQuery = lastUserMessage ? lastUserMessage.content : '';
    
    // Generate mock response
    const mockResponse = generateMockResponse(userQuery, subject, learningStyle);
    
    // Return the response
    return NextResponse.json({
      id: `mock-${Date.now()}`,
      content: mockResponse,
      role: 'assistant',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Mock AI Tutor API error:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
} 