import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL is not configured');
      return new Response(JSON.stringify({ error: 'Webhook URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare payload for n8n webhook
    const payload = {
      message: body.message,
      tool: body.tool || 'default',
      sessionId: body.sessionId || 'anonymous',
      userId: body.userId,
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin')
      }
    };

    console.log('🔌 Sending to n8n webhook:', webhookUrl);
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));

    // Forward request to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Webhook response error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      return new Response(JSON.stringify({ 
        error: 'Failed to process message',
        details: errorText 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle streaming response if needed
    const contentType = response.headers.get('content-type');
    console.log('📥 Response content-type:', contentType);
    
    if (contentType?.includes('text/event-stream')) {
      // For streaming responses, pass through the stream
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }
    
    // For non-streaming responses, convert to streaming for smooth display
    const responseText = await response.text();
    let responseData: any;
    
    // Parse response based on content type
    if (contentType?.includes('text/html') || contentType?.includes('text/plain')) {
      // For text/html or text/plain responses from n8n
      responseData = { response: responseText.trim(), sources: [] };
    } else {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // Fallback for any unparseable response
        responseData = { response: responseText.trim(), sources: [] };
      }
    }
    
    // Create a streaming response for smooth character-by-character display
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const text = responseData.message || responseData.response || 'I received your message. Processing...';
        const sources = responseData.sources || responseData.references || [];
        
        // Send text in chunks for smooth streaming effect
        const chunkSize = 2; // Characters per chunk for smoother effect
        for (let i = 0; i < text.length; i += chunkSize) {
          const chunk = text.slice(i, i + chunkSize);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk, type: 'text' })}\n\n`));
          
          // Small delay for typing effect (adjust as needed)
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        // Send sources at the end
        if (sources.length > 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources, type: 'sources' })}\n\n`));
        }
        
        // Send done signal
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('API route error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Optional: Add GET method for health check
export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ok',
    webhook: process.env.N8N_WEBHOOK_URL ? 'configured' : 'not configured'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}