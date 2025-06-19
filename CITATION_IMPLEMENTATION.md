# Citation Generation Implementation in Lawyer Chat

## Overview
The citation/reference system in Lawyer Chat is designed to provide legal document sources for AI responses. Citations are handled throughout the entire data flow from the n8n webhook to the UI display.

## Frontend Implementation (UI)

### 1. Message Interface Structure
```typescript
interface Message {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  references?: string[];  // Array of citation URLs/references
  timestamp: Date;
}
```

### 2. Citation Display in UI (`src/app/page.tsx`)
Citations are displayed below assistant messages in a "Sources" section:

```typescript
{/* Citation Display */}
{message.references && message.references.length > 0 && (
  <div className={`mt-3 pt-3`}>
    <h4 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Sources:</h4>
    <ol className="list-decimal list-inside space-y-1">
      {message.references.map((ref, index) => (
        <li key={index} className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
          {session ? (
            <a 
              href={ref} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`underline ml-1 transition-colors font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-800 hover:text-blue-900'}`}
            >
              {ref}
            </a>
          ) : (
            <span className={`ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{ref}</span>
          )}
        </li>
      ))}
    </ol>
  </div>
)}
```

### 3. Key UI Features:
- **Numbered List**: Citations appear as an ordered list with decimal numbering
- **Authentication Gating**: Citations are clickable links for logged-in users, plain text for guests
- **Dark Mode Support**: Different colors for light/dark themes
- **Styling**: Small text size (text-xs), underlined links, hover effects

## Backend Implementation

### 1. API Route (`src/app/api/chat/route.ts`)
The chat API handles citations in two ways:

#### For Streaming Responses:
```typescript
// When n8n returns streaming data
if (data.type === 'sources') {
  sources = data.sources || [];
  setMessages(prev => 
    prev.map(msg => 
      msg.id === assistantId 
        ? { ...msg, references: sources }
        : msg
    )
  );
}
```

#### For JSON Responses:
```typescript
// Extract sources from n8n response
const sources = responseData.sources || responseData.references || [];

// Stream sources separately after text
if (sources.length > 0) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources, type: 'sources' })}\n\n`));
}
```

### 2. Data Flow:
1. **User Query** → Next.js API → n8n Webhook
2. **n8n Processing** → Returns response with `sources` or `references` array
3. **API Route** → Converts to streaming format with separate source event
4. **Frontend** → Updates message state with references array
5. **Database** → Saves message with references to PostgreSQL

### 3. Database Storage (`prisma/schema.prisma`)
```prisma
model Message {
  id          String   @id @default(cuid())
  chatId      String
  role        String   // "user" or "assistant"
  content     String   @db.Text
  references  String[] // Array of document references/citations
  createdAt   DateTime @default(now())
  
  chat Chat @relation(fields: [chatId], references: [id], onDelete: Cascade)
}
```

Citations are stored as a PostgreSQL array of strings in the `references` column.

### 4. Message Persistence (`src/app/api/chats/[id]/messages/route.ts`)
When saving messages to the database:
```typescript
const message = await prisma.message.create({
  data: {
    chatId,
    role: body.role,
    content: body.content,
    references: body.references || []  // Saves citation array
  }
});
```

## Expected n8n Response Format

The n8n webhook should return citations in one of these formats:

### Option 1: Streaming Response
```
data: {"type": "text", "text": "Legal response text..."}
data: {"type": "sources", "sources": ["url1", "url2", "url3"]}
data: {"type": "done"}
```

### Option 2: JSON Response
```json
{
  "response": "Legal response text...",
  "sources": ["url1", "url2", "url3"]
}
```
or
```json
{
  "message": "Legal response text...",
  "references": ["url1", "url2", "url3"]
}
```

## Current Status
- ✅ Frontend display logic implemented
- ✅ Backend API supports citation handling
- ✅ Database schema supports citation storage
- ✅ Streaming and JSON response formats supported
- ⚠️ Actual citation URLs depend on n8n/Haystack integration
- ⚠️ Currently expects URLs as strings, may need enhancement for richer citation objects

## Future Enhancements
1. **Rich Citation Objects**: Support for citation metadata (title, date, court, etc.)
2. **Citation Preview**: Hover tooltips with document previews
3. **Citation Filtering**: Filter by court, date, relevance
4. **Citation Export**: Export citations in legal citation formats
5. **Cached Citations**: Cache frequently accessed documents