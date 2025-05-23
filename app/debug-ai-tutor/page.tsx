"use client";

import React, { useState } from 'react';

export default function DebugAITutor() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [useMockApi, setUseMockApi] = useState(true);
  const [apiUrl, setApiUrl] = useState('/api/mock-ai-tutor');
  const [subject, setSubject] = useState('General Knowledge');
  const [learningStyle, setLearningStyle] = useState('visual');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    setLoading(true);
    setError('');
    
    const newMessages = [
      ...messages,
      { role: 'user', content: input }
    ];
    
    setMessages(newMessages);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          subject,
          learningStyle
        }),
      });
      
      const responseText = await response.text();
      console.log('Raw API Response:', responseText);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${responseText}`);
      }
      
      try {
        const data = JSON.parse(responseText);
        setResponse(data);
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      } catch (e) {
        setError(`Failed to parse JSON response: ${responseText}`);
      }
    } catch (err: any) {
      console.error('Error calling AI tutor API:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const toggleApiMode = () => {
    const newMode = !useMockApi;
    setUseMockApi(newMode);
    setApiUrl(newMode ? '/api/mock-ai-tutor' : '/api/ai-tutor');
  };

  const clearChat = () => {
    setMessages([]);
    setResponse(null);
    setError('');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Tutor Debug Interface</h1>
      
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Debug Mode</p>
        <p>This interface helps test the AI tutor integration. You can switch between the real API (Claude 3.5 Sonnet) and a mock.</p>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center">
          <label htmlFor="api-toggle" className="mr-2">API:</label>
          <button
            id="api-toggle"
            onClick={toggleApiMode}
            className={`px-4 py-2 rounded ${useMockApi 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'}`}
          >
            {useMockApi ? 'Using Mock API (Safe)' : 'Using Claude 3.5 Sonnet'}
          </button>
        </div>
        
        <button
          onClick={clearChat}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Clear Chat
        </button>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label htmlFor="subject" className="block text-sm mb-1">Subject:</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        
        <div>
          <label htmlFor="learning-style" className="block text-sm mb-1">Learning Style:</label>
          <select
            id="learning-style"
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="visual">Visual</option>
            <option value="auditory">Auditory</option>
            <option value="reading">Reading/Writing</option>
            <option value="kinesthetic">Kinesthetic</option>
            <option value="socratic">Socratic</option>
            <option value="structured">Structured</option>
            <option value="exploratory">Exploratory</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-wrap">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="border rounded-lg mb-4 p-4 h-[400px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center mt-20">
            Start a conversation with the AI tutor
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-4 p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-100 ml-10' 
                  : 'bg-gray-100 mr-10'
              }`}
            >
              <div className="font-bold">{msg.role === 'user' ? 'You' : 'AI Tutor'}</div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-blue-500"></div>
            <span className="ml-2">The AI tutor is thinking...</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI tutor something..."
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          Send
        </button>
      </form>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Debug Information:</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p><strong>API URL:</strong> {apiUrl}</p>
          <p><strong>Model:</strong> {useMockApi ? 'Mock Responses' : 'Claude 3.5 Sonnet'}</p>
          <p><strong>Subject:</strong> {subject}</p>
          <p><strong>Learning Style:</strong> {learningStyle}</p>
        </div>
        
        <h3 className="text-lg font-bold mt-4 mb-2">Raw API Response:</h3>
        <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-60">
          {response ? JSON.stringify(response, null, 2) : 'No response yet'}
        </pre>
      </div>
    </div>
  );
} 