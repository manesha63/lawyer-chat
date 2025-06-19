# Lawyer Chat - AI Legal Assistant

## Overview
Lawyer Chat is a Next.js 15.3.3 web application providing an AI-powered chat interface for legal document queries. It integrates with n8n workflows and DeepSeek AI to deliver intelligent legal assistance with document citations.

## Tech Stack
- **Frontend**: Next.js 15.3.3, React 19, TypeScript, Tailwind CSS v4
- **Auth**: NextAuth.js with Google OAuth (JWT sessions)
- **Database**: PostgreSQL with Prisma ORM
- **State**: Zustand with persistence
- **AI Integration**: n8n webhooks → DeepSeek R1 model
- **UI Libraries**: Lucide icons, React Markdown

## Architecture

### Data Flow
```
User → Next.js App → API Route → n8n Webhook → DeepSeek AI → Response Streaming → UI
                          ↓                           ↓
                     PostgreSQL ← ─────────────────────┘
```

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (TaskBar, Sidebar, DarkMode)
- `src/store/` - Zustand state management
- `prisma/` - Database schema and migrations

## ✅ Implemented Features

### UI Components
- **Chat Interface**: Single-page app with welcome screen, streaming responses, markdown support
- **TaskBar**: Universal sidebar with chat history, new chat button, auth controls
  - Responsive chat section that adjusts when taskbar expands/collapses
  - State managed through Zustand for consistent behavior
- **Dark Mode**: Complete theme switching with persistence via Zustand
- **Responsive Design**: Mobile-first with collapsible sidebars and overlays
- **Professional Theme**: Legal colors (#004A84 blue, #C7A562 gold)

### Backend Integration
- **n8n Webhook**: Complete API route with streaming support at `/api/chat`
- **Authentication**: NextAuth with Google OAuth (JWT sessions)
- **Chat Management**: Full CRUD APIs for chats and messages
- **Database Schema**: Prisma models for users, chats, messages with citations

### User Experience
- **Guest Mode**: Full chat functionality without login
- **Auth Features**: Chat history, clickable citations for logged-in users
- **Real-time Updates**: Streaming responses with typing animation
- **Search**: Chat history search functionality
- **Tools**: Recursive Summary tool dropdown

## n8n Workflow Integration

### Webhook Flow
1. **Frontend** sends message to `/api/chat`
2. **API Route** validates and enriches payload:
   ```json
   {
     "message": "user query",
     "tool": "default | recursive_summary",
     "sessionId": "user@email or anonymous",
     "timestamp": "ISO 8601",
     "metadata": { "userAgent", "origin" }
   }
   ```
3. **n8n Webhook** processes with DeepSeek AI
4. **Response** streams back with 30ms character delay
5. **Database** stores messages for authenticated users

### Response Handling
- Streaming responses passed through with SSE headers
- JSON/HTML converted to streaming format
- Sources sent as separate SSE event
- Character chunking: 2 chars at 30ms intervals

## 🔥 Critical Issues to Fix

1. **Export authOptions** - Update NextAuth route to export authOptions (blocking chat APIs)
2. **Database Connection** - PostgreSQL needs setup and connection string
3. **Prisma Adapter** - Configure NextAuth to use Prisma adapter instead of JWT
4. **Real Credentials** - Google OAuth needs actual client ID/secret
5. **Database Migrations** - Run `npx prisma db push` after database setup

## 📋 Next Development Steps

### Immediate (This Week)
1. **Fix Auth** - Export authOptions, configure Prisma adapter
2. **Database** - Set up PostgreSQL, run migrations
3. **Testing** - Verify n8n webhook connection with test scripts

### Short Term (Next 2 Weeks)
1. **Citations** - Connect Haystack for real document links
2. **Error Handling** - Add boundaries and loading states
3. **Performance** - Implement caching for documents

### Long Term
1. **Export Features** - PDF/Word transcript exports
2. **Voice Input** - Speech-to-text integration
3. **Analytics** - Usage tracking and insights

## Quick Start

```bash
# Install and setup
npm install
cp .env.example .env.local  # Configure environment variables
npx prisma generate        # Generate Prisma client
npx prisma db push         # Create database schema

# Development
npm run dev                # Start on port 3001

# Testing webhook
node test-api.js           # Test chat API
node test-webhook.js       # Test n8n integration
```

### Environment Variables
```bash
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
DATABASE_URL=postgresql://user:pass@localhost:5432/lawyerchat
N8N_WEBHOOK_URL=http://localhost:5678/webhook/c188c31c-1c45-4118-9ece-5b6057ab5177
```

## API Endpoints

### Chat
- `POST /api/chat` - Send message to AI (streaming response)
- `GET /api/chat` - Health check

### Chat Management
- `GET /api/chats` - List user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/[id]` - Get chat with messages
- `DELETE /api/chats/[id]` - Delete chat
- `POST /api/chats/[id]/messages` - Save message

## Technical Notes

### Architecture Decisions
- Single-page app with chat as homepage
- JWT sessions (temporary - migrate to database)
- Zustand for persistent UI state
- Character streaming with 30ms delay
- Guest mode with progressive enhancement

### Security
- OAuth-only authentication
- Input validation on all API routes
- Environment variables for secrets
- CORS configured for n8n integration

## Citation System

### Overview
Citations provide legal document sources for AI responses, displayed as numbered lists below assistant messages. Authenticated users get clickable links; guests see plain text.

### Implementation Flow
1. **n8n Response**: Returns `sources` or `references` array with document URLs
2. **API Route**: Streams citations as separate SSE event after response text
3. **Frontend**: Updates message state with references array and displays below text
4. **Database**: Stores citations in PostgreSQL array column

### Data Formats
- **Streaming**: `data: {"type": "sources", "sources": ["url1", "url2"]}`
- **JSON**: `{"response": "text", "sources": ["url1", "url2"]}`
- **UI Display**: Ordered list with hover effects, dark mode support
- **Auth Gating**: Links for logged-in users, plain text for guests

### Current Status
✅ Full stack implementation complete (UI, API, database)  
⚠️ Actual URLs depend on n8n/Haystack integration  
🔮 Future: Rich metadata, previews, legal format export

## Color Palette Reference

### Light Mode Colors
- **Primary Blue**: `#004A84` - Headers, text, buttons, icons
- **Light Blue**: `#226EA7` - User message bubbles, secondary elements
- **Gold**: `#C7A562` - Primary buttons, CTAs, accents
- **Light Gold**: `#E1C88E` - Welcome text, secondary buttons
- **Hover Gold**: `#B59552` - Hover state for gold elements
- **White**: `#FFFFFF` - Backgrounds, cards
- **Grays**: `#6B7280`, `#9CA3AF`, `#D1D5DB` - Text hierarchy

### Dark Mode Colors
- **Background**: `#1a1b1e` - Main background
- **Secondary BG**: `#25262b` - Sidebars, inputs, cards
- **Text Primary**: `#D1D5DB` - Main text
- **Text Muted**: `#8E8E93` - Secondary text
- **Soft White**: `#9CA3AF` - Welcome messages, prompts
- **Borders**: `#2E2E38` - Dividers, borders
- **White**: `#FFFFFF` - High contrast elements

### Usage Patterns
- **Headers/Navigation**: Blue (#004A84) in light, white in dark
- **Buttons**: Gold (#C7A562) in light, transparent with borders in dark
- **Messages**: Blue bubbles for user, gold for assistant
- **Interactive Hover**: Darker shade variations (~10-15% darker)

## Account Button

The account button is located at the bottom of the sidebar and handles authentication:
- **Guest Mode**: Shows "?" icon with "Guest/Not signed in" text
- **Signed In**: Shows user avatar/initial with name and "Signed in" status
- **Click Action**: Opens dropdown menu above button
- **Guest Menu**: "Sign in to your account" option triggers Google OAuth
- **User Menu**: Shows email and "Sign out" option
- **Positioning**: Always visible, menu appears above with min-width 200px
- **Authentication**: Handled via NextAuth.js with Google OAuth
- **Benefits**: Signed-in users get chat history and clickable citations

## Troubleshooting

### Common Issues
1. **Webhook not responding**: Check n8n is running and workflow activated
2. **Auth failing**: Verify NEXTAUTH_SECRET and Google OAuth credentials
3. **Database errors**: Ensure PostgreSQL is running and migrations applied
4. **Chat not streaming**: Verify webhook URL in .env.local

### Production Checklist
- [ ] Real OAuth credentials
- [ ] Database migrations
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error monitoring setup