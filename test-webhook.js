#!/usr/bin/env node

// Test script to verify n8n webhook connectivity

async function testWebhook() {
  console.log('🔍 Testing n8n webhook connectivity...\n');

  const webhookUrl = 'http://localhost:5678/webhook/c188c31c-1c45-4118-9ece-5b6057ab5177';
  
  try {
    // Test 1: Check if n8n is running
    console.log('1️⃣ Checking if n8n is accessible...');
    const healthCheck = await fetch('http://localhost:5678/healthz');
    if (healthCheck.ok) {
      console.log('✅ n8n is running on port 5678\n');
    } else {
      console.log('❌ n8n is not accessible\n');
      return;
    }

    // Test 2: Test webhook with direct POST
    console.log('2️⃣ Testing webhook directly...');
    const testPayload = {
      message: 'Test message from test script',
      sessionId: 'test-session',
      tool: 'default',
      timestamp: new Date().toISOString()
    };

    console.log('Sending payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    let responseBody;

    if (contentType?.includes('text/event-stream')) {
      responseBody = await response.text();
      console.log('✅ Received streaming response');
    } else if (contentType?.includes('application/json')) {
      responseBody = await response.json();
      console.log('✅ Received JSON response');
    } else {
      responseBody = await response.text();
      console.log('✅ Received text response');
    }

    console.log('\nResponse body:', responseBody);

    // Test 3: Test our API endpoint (if server is running)
    console.log('\n3️⃣ Testing our /api/chat endpoint...');
    try {
      const apiResponse = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Test from API',
          sessionId: 'test-api'
        })
      });

      if (apiResponse.ok) {
        console.log('✅ API endpoint is working');
        const reader = apiResponse.body.getReader();
        const decoder = new TextDecoder();
        
        console.log('\nStreaming response:');
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          process.stdout.write(chunk);
        }
      } else {
        console.log('❌ API endpoint returned error:', apiResponse.status);
      }
    } catch (err) {
      console.log('⚠️  Next.js server not running on port 3001');
      console.log('   Run "npm run dev" to start the server');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testWebhook().catch(console.error);