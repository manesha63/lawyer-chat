#!/usr/bin/env node

// Test script for the chat API
const testChatAPI = async () => {
  console.log('Testing lawyer-chat API...\n');

  // Test 1: Check if API is running
  try {
    const healthResponse = await fetch('http://localhost:3001/api/chat', {
      method: 'GET'
    });
    const healthData = await healthResponse.json();
    console.log('✓ API Health Check:', healthData);
  } catch (error) {
    console.log('✗ API not running on http://localhost:3001');
    console.log('  Please start the app with: npm run dev\n');
    return;
  }

  // Test 2: Send a test message
  try {
    console.log('\nSending test message...');
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        tool: 'test',
        sessionId: 'test-session'
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('✗ Error sending message:', error.message);
  }
};

testChatAPI();