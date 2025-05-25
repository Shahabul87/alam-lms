// Test script for the DeepSeek AI Tutor integration
const fetch = require('node-fetch');
const axios = require('axios');

// Use environment variable or fallback to localhost for development
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testAITutor() {
  console.log('Testing DeepSeek AI Tutor integration...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'What is photosynthesis? Please explain in a way that helps visual learners.'
          }
        ],
        subject: 'Biology',
        learningStyle: 'visual'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('DeepSeek AI Tutor response:');
    console.log('----------------------------');
    console.log(data.content);
    console.log('----------------------------');
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

testAITutor(); 