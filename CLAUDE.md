# Lawyer Chat - AI-Powered Legal Assistant Interface

## Project Overview and Purpose

Lawyer Chat is a sophisticated Next.js web application that serves as the frontend interface for Data Compose's legal document processing platform. Built with Next.js 15.3.3, TypeScript, and Tailwind CSS v4, it provides legal professionals with an AI-powered conversational interface to interact with large-scale judicial and legal document collections through integration with n8n workflow automation and the DeepSeek R1 AI model.

### Core Features
- **AI-Powered Chat Interface**: Real-time conversation with DeepSeek R1 model via n8n webhooks
- **Legal Document Citations**: Assistant responses include clickable references to source documents
- **User Authentication**: NextAuth.js integration with Google OAuth and session management
- **Chat History Management**: Persistent conversation storage with PostgreSQL via Prisma ORM
- **Responsive Design**: Mobile-first SPA with collapsible sidebar and professional legal UI
- **Legal Tools Integration**: Specialized tools for recursive document summarization
- **Guest Mode Support**: Full functionality without login, with enhanced features for authenticated users

## Technical Stack

### Core Technologies
- **Framework**: Next.js 15.3.3 with App Router and React 19
- **Language**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS v4 (CSS-based configuration)
- **Authentication**: NextAuth.js v4 with JWT strategy
- **Database ORM**: Prisma 6.9.0 with PostgreSQL
- **UI Components**: Lucide React icons
- **Development**: Turbopack, ESLint 9, PostCSS

### Key Dependencies
```json
{
  "next": "15.3.3",
  "react": "^19.0.0",
  "next-auth": "^4.24.11",
  "@next-auth/prisma-adapter": "^1.0.7",
  "@prisma/client": "^6.9.0",
  "tailwindcss": "^4.1.10",
  "lucide-react": "^0.515.0",
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1",
  "zustand": "^5.0.5",
  "date-fns": "^4.1.0"
}
```

## Architecture Overview

### System Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  API Routes     │────▶│ n8n Webhooks    │────▶│ DeepSeek AI     │
│   (Port 3001)   │     │  /api/chat      │     │ (Port 8080)     │     │ & Haystack      │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                                               │
         │                       ▼                                               │
         │              ┌─────────────────┐                                     │
         └─────────────▶│   PostgreSQL    │◀────────────────────────────────────┘
                        │   Database      │
                        └─────────────────┘
```

### Data Flow
1. **User Input**: Chat message entered in frontend UI
2. **API Processing**: Next.js API route validates and forwards to n8n
3. **Workflow Execution**: n8n processes query with DeepSeek AI and/or Haystack search
4. **Response Streaming**: AI response streamed back through API to frontend
5. **Persistence**: Messages saved to PostgreSQL via Prisma ORM

### Database Schema
- **User Model**: Authentication data, profile information
- **Account Model**: OAuth provider information
- **Session Model**: User sessions (currently using JWT)
- **Chat Model**: Conversation containers with metadata
- **Message Model**: Individual messages with role, content, and citations

## Project Structure

```
lawyer-chat/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts  # NextAuth configuration
│   │   │   ├── chat/
│   │   │   │   └── route.ts      # Chat webhook integration
│   │   │   └── chats/
│   │   │       ├── route.ts      # Chat CRUD operations
│   │   │       └── [id]/
│   │   │           ├── route.ts  # Individual chat operations
│   │   │           └── messages/
│   │   │               └── route.ts  # Message operations
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   └── error/
│   │   │       └── page.tsx
│   │   ├── globals.css           # Global styles with Tailwind
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Main chat interface
│   │   └── favicon.ico
│   ├── components/               # React components
│   │   ├── ChatHistorySidebar.tsx    # Chat history navigation
│   │   ├── Sidebar.tsx                # Main navigation sidebar
│   │   ├── DarkModeToggle.tsx         # Dark mode toggle component
│   │   ├── DarkModeWrapper.tsx        # Dark mode context wrapper
│   │   └── providers.tsx              # NextAuth SessionProvider
│   ├── generated/                # Prisma generated client
│   │   └── prisma/
│   ├── lib/
│   │   └── prisma.ts             # Prisma client singleton
│   └── store/
│       └── sidebar.ts            # Zustand store for sidebar/dark mode
├── prisma/
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
│   └── *.svg                     # Icons and images
├── package.json                  # Dependencies and scripts
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.mjs           # PostCSS configuration
└── eslint.config.mjs            # ESLint configuration
```

## Current Implementation Status

### ✅ Completed Features
- [x] **Project Foundation**:
  - Next.js 15.3.3 with TypeScript and strict mode
  - Tailwind CSS v4 with CSS-based configuration
  - All dependencies correctly installed and configured
  - ESLint and PostCSS properly set up
  - Zustand for state management
  - React Markdown with GFM support
  - Date-fns for time formatting

- [x] **Database Architecture**:
  - Complete Prisma schema with NextAuth and Chat models
  - User, Account, Session, VerificationToken models for authentication
  - Chat and Message models with references array for legal citations
  - Prisma client configured in `src/lib/prisma.ts`
  - Generated client available in `src/generated/prisma/`

- [x] **Authentication System**:
  - NextAuth API route at `src/app/api/auth/[...nextauth]/route.ts`
  - Google OAuth provider configured (credentials needed)
  - JWT session strategy with 30-day expiration
  - SessionProvider integrated in app layout
  - Custom callbacks for user ID handling

- [x] **Complete Chat Interface** (Main Page):
  - **Professional UI**: Legal-focused design with custom color scheme:
    - Primary: #004A84 (dark blue), #226EA7 (light blue)
    - Accent: #C7A562 (gold), #E1C88E (light gold)
  - **Single-page app**: Chat interface as homepage, not separate route
  - **Welcome screen**: Large gold welcome message that disappears on first query
  - **Real-time streaming**: Character-by-character text and source streaming
  - **Message bubbles**: User (blue) and assistant (gold) with proper styling
  - **Citation system**: Sources section with auth-gated clickable links
  - **Legal tools**: Recursive Summary tool with dropdown interface
  - **Responsive design**: Mobile-friendly with collapsible sidebar for logged users
  - **Dynamic input**: Auto-expanding textarea with tool icon integration
  - **Guest mode**: Full functionality without login, limited features
  - **Logged-in perks**: Chat history sidebar, clickable citations
  - **Dark mode**: Full dark mode support with toggle in header
  - **Persistent state**: Sidebar and dark mode preferences saved via Zustand
  - **Markdown support**: Full markdown rendering with react-markdown and remark-gfm

- [x] **Environment Configuration**:
  - Complete `.env.local` with all required variables
  - NextAuth, database, Google OAuth, and n8n URLs configured
  - Development environment ready

### ⚠️ Partially Implemented
- [x] **Authentication (80% complete)**:
  - NextAuth functional with JWT sessions (database sessions not configured)
  - Prisma adapter dependency installed but not configured in NextAuth
  - Google OAuth ready but needs real credentials
  - Custom sign-in page with Google OAuth button
  - Error handling and callback URL support
  - **Issue**: `authOptions` not exported from NextAuth route (needed for API routes)

- [x] **Chat History Management (90% complete)**:
  - Complete API endpoints for chat CRUD operations
  - Messages API for saving chat history
  - Sidebar component with chat list and search
  - Real-time updates when new messages are sent
  - **Working**: All endpoints functional, UI integration complete
  - **Missing**: Database persistence requires real database connection

### ✅ Recent Implementation Updates

#### **🎉 Major Features Completed** (Latest Sessions)

##### **Webhook Integration**
- [x] **API Route Created**: `/src/app/api/chat/route.ts` for n8n webhook integration
  - Full error handling and validation
  - Support for both streaming and JSON responses
  - Proper webhook URL configuration via environment variables
  - Health check endpoint included
- [x] **Frontend Integration**: Chat component updated to use real API endpoint
  - Replaced mock responses with actual API calls
  - Streaming response handling implemented
  - Error states properly displayed to users
- [x] **Environment Configuration**: Updated `.env.local` with correct webhook URL
  - `N8N_WEBHOOK_URL=http://localhost:5678/webhook/c188c31c-1c45-4118-9ece-5b6057ab5177`
  - Note included for production deployment

##### **Dark Mode Implementation**
- [x] **Dark Mode Toggle**: Complete dark/light theme switching
  - Toggle button in header with sun/moon icons
  - Persistent preference using Zustand store
  - Smooth transitions between themes
  - Custom dark color palette implemented
- [x] **Dark Theme Colors**:
  - Background: #343541 (main), #202123 (sidebar)
  - Text: #D1D5DB (primary), #8E8E93 (muted)
  - Borders: #2E2E38
  - Full application-wide dark mode support

##### **State Management**
- [x] **Zustand Store**: Global state management for UI preferences
  - Sidebar expansion state persisted
  - Dark mode preference persisted
  - Local storage persistence configured
  - Clean API for component integration

##### **Enhanced UI Components**
- [x] **Sidebar Redesign**: Professional navigation sidebar
  - Account button with dropdown menu
  - Chat history with search functionality
  - New chat button with custom styling
  - Responsive collapse/expand behavior
  - Mobile-friendly overlay system
- [x] **Chat History Features**:
  - Search through previous chats
  - Time-based sorting (newest first)
  - Preview text for each chat
  - Click to load previous conversations
  - Delete chat functionality (API ready)

##### **Additional Files Created**
- [x] **Test Script**: `test-api.js` for testing chat API endpoints
- [x] **Documentation**: `ACCOUNT_BUTTON_GUIDE.md` explaining authentication UI

### Key Implementation Details

#### Chat Interface (`src/app/page.tsx`)
- **Single-page application**: Chat interface is the homepage, not a separate route
- **Welcome screen**: Large gold welcome message that disappears after first query
- **Real-time streaming**: Character-by-character text animation for AI responses
- **Message bubbles**: User messages (blue) and assistant responses (gold)
- **Citation system**: Sources section with auth-gated clickable links
- **Tool selection**: Dropdown for selecting legal analysis tools
- **Responsive design**: Collapsible sidebar for authenticated users

#### API Integration (`src/app/api/chat/route.ts`)
- **Webhook URL**: Configured via `N8N_WEBHOOK_URL` environment variable
- **Error handling**: Comprehensive validation and error responses
- **Response formats**: Supports JSON, HTML, and streaming responses
- **Health check**: GET endpoint for monitoring webhook configuration
- **CORS handling**: Configured for cross-origin requests from n8n

#### Authentication (`src/app/api/auth/[...nextauth]/route.ts`)
- **Provider**: Google OAuth configured (requires real credentials)
- **Session strategy**: JWT with 30-day expiration
- **Callbacks**: Custom JWT and session callbacks for user ID handling
- **Pages**: Custom signin and error pages

### ❌ Remaining Implementation Tasks

#### **🔥 Critical Issues (Blocks Core Functionality)**
- [ ] **Export authOptions**: Need to export authOptions from NextAuth route for API routes to work
- [ ] **Database Connection**: PostgreSQL database needs to be set up and connected
- [ ] **Database Sessions**: NextAuth using JWT instead of database persistence
- [ ] **Prisma Adapter**: Installed but not configured in NextAuth
- [ ] **Real Credentials**: Google OAuth needs actual client ID/secret

#### **⚠️ Required Features**
- [ ] **Error Boundaries**: No error handling for failed API calls
- [ ] **Loading States**: Missing proper loading indicators during API calls
- [ ] **Database Migrations**: No Prisma migrations created or run

#### **📈 Enhancements**
- [ ] **Document Links**: Citation URLs need real Haystack integration
- [ ] **Export Features**: No way to export chat transcripts
- [ ] **User Profile**: No user profile management
- [ ] **Settings Page**: No user settings or preferences page

## Next Implementation Steps

### 🎯 **Phase 1: Fix Critical Issues** (Immediate)

#### **1. Fix authOptions Export** 🔥
```bash
# The authOptions configuration needs to be exported for API routes to work
# This is blocking all chat API functionality
1. Update src/app/api/auth/[...nextauth]/route.ts to export authOptions
2. Test that chat APIs can access session data
```

#### **2. Test Webhook Connection** ✅
```bash
# From lawyer-chat directory:
1. Ensure data-compose services are running:
   cd ../data-compose && docker-compose up -d
2. Import n8n workflow:
   - Access n8n at http://localhost:5678
   - Import workflow_json/web_UI_basic
   - Activate the workflow
3. Test the integration:
   npm run dev  # Start lawyer-chat on port 3001
   # Try sending a message in the chat interface
```

#### **3. Fix Database Integration** 
```bash
# Required tasks:
1. Export authOptions from NextAuth route
2. Update NextAuth config to use Prisma adapter
3. Set up PostgreSQL database locally/cloud
4. Run Prisma migrations: `npx prisma db push`
5. Test authentication with database persistence
```

#### **3. Verify AI Model Connection**
```bash
# Ensure DeepSeek model is running:
1. Check Ollama service in data-compose
2. Verify model is loaded: curl http://localhost:11434/api/tags
3. Test model directly: curl http://localhost:11434/api/generate -d '{"model":"deepseek-r1:1.5b","prompt":"Hello"}'
```

### 🔧 **Phase 2: Real AI Integration** (Week 2)

#### **4. Replace Mock Responses**
```typescript
// Update handleSend() function:
- Remove mock streaming logic
- Implement real API calls to /api/chat
- Handle streaming responses from n8n
- Maintain existing UI animations
```

#### **5. Message Persistence**
```typescript
// Database operations:
- Save user messages to Chat/Message models
- Store AI responses with citations
- Load chat history for authenticated users
- Implement chat session management
```

#### **6. Real Citation System**
```typescript
// Document integration:
- Connect to Haystack search API
- Return real legal document references
- Implement clickable citation links
- Cache frequently accessed documents
```

### 🎨 **Phase 3: User Experience** (Week 3)

#### **7. Error Handling & Feedback**
```typescript
// User experience improvements:
- Error boundaries for API failures
- Loading states for long operations
- Toast notifications for errors
- Graceful degradation for offline
```

#### **8. Chat History Management**
```typescript
// Multi-session support:
- Create new chat sessions
- Load previous conversations
- Delete/archive old chats
- Search through chat history
```

### 🚀 **Phase 4: Production Ready** (Week 4)

#### **9. Security & Performance**
```bash
# Production checklist:
- Rate limiting for API routes
- Input validation and sanitization
- Database query optimization
- Caching strategy for citations
```

#### **10. Deployment Preparation**
```bash
# Deployment tasks:
- Environment variable configuration
- Database migration scripts
- Build optimization
- Monitoring and logging setup
```

## Current Development Priorities

### **🔥 Immediate Actions Needed:**
1. **Fix authOptions export** - Export authOptions from NextAuth route (blocking chat APIs)
2. **Set up PostgreSQL database** - Local or cloud instance for data persistence
3. **Test webhook integration** - Ensure n8n workflow is active and responding
4. **Fix NextAuth Prisma adapter** - Enable database sessions instead of JWT

### **✅ Recently Completed:**
- **Dark Mode Implementation** - Full theme switching with persistence
- **Sidebar Redesign** - Professional navigation with account management
- **Chat History APIs** - Complete CRUD endpoints for chat management
- **Zustand State Management** - Persistent UI preferences
- **Enhanced UI Components** - Markdown support, responsive design
- **Created `/api/chat` endpoint** - Full webhook integration with error handling
- **Updated frontend** - Real API calls replace mock responses
- **Environment setup** - Webhook URLs properly configured

### **💡 Architecture Decisions Made:**
- Single-page chat interface (not `/chat` route)
- JWT sessions temporarily (should switch to database)
- Zustand for UI state management with persistence
- Custom color scheme (#004A84, #C7A562) with dark mode
- Responsive design with auth-gated features
- Markdown rendering for AI responses

### **⚠️ Technical Debt:**
- authOptions not exported (blocking API routes)
- NextAuth configuration inconsistency (JWT vs database)
- No database connection established
- Missing error boundaries and loading states
- No automated testing infrastructure
- No Prisma migrations created

## Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Linting
npm run lint

# Prisma commands
npx prisma db push          # Push schema to database
npx prisma generate         # Generate Prisma client
npx prisma studio          # Open Prisma Studio GUI
```

## Environment Configuration

### Required Environment Variables
```bash
# .env.local
# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (replace with real credentials)
GOOGLE_CLIENT_ID=demo-client-id
GOOGLE_CLIENT_SECRET=demo-client-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lawyerchat

# n8n Integration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/c188c31c-1c45-4118-9ece-5b6057ab5177
```

### Development Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Database Setup**:
   ```bash
   npx prisma generate    # Generate Prisma client
   npx prisma db push     # Create database schema
   ```

4. **Run Development Server**:
   ```bash
   npm run dev           # Starts on port 3001
   ```

## API Documentation

### Chat API Endpoints

#### POST `/api/chat`
Send a message to the AI assistant.

**Request Body**:
```json
{
  "message": "string",
  "tool": "default | recursive_summary",
  "sessionId": "string",
  "userId": "string (optional)"
}
```

**Response**:
```json
{
  "response": "string",
  "sources": ["string"]
}
```

#### GET `/api/chat`
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "webhook": "configured | not configured"
}
```

### Chat Management Endpoints

#### GET `/api/chats`
Get all chats for authenticated user.

#### POST `/api/chats`
Create a new chat session.

#### GET `/api/chats/[id]`
Get specific chat with messages.

#### DELETE `/api/chats/[id]`
Delete a chat session.

#### POST `/api/chats/[id]/messages`
Add message to chat (for persistence).

## Integration Points

### Existing Data Compose Services
- **n8n Workflows**: HTTP endpoints at workflow URLs
- **PostgreSQL**: Shared database for user management
- **DeepSeek R1**: AI model via Ollama integration
- **Haystack API**: Document search and retrieval
- **Elasticsearch**: Document storage and indexing

### Data Flow
1. User submits question via chat interface
2. Next.js API route forwards to appropriate n8n workflow
3. n8n processes query using DeepSeek AI and/or Haystack search
4. Response with citations returned to frontend
5. Chat history saved to PostgreSQL via Prisma

## Design Decisions

### UI/UX Design
- **Color Scheme**: Professional legal theme
  - Primary: #004A84 (dark blue), #226EA7 (light blue)
  - Accent: #C7A562 (gold), #E1C88E (light gold)
  - Based on traditional legal document aesthetics
- **Single Page App**: Chat interface as homepage for immediate engagement
- **Guest Support**: Full functionality without login to reduce friction
- **Mobile First**: Responsive design with collapsible elements

### Technical Decisions
- **JWT Sessions**: Chosen for simplicity, should migrate to database sessions
- **Webhook Integration**: Decouples frontend from backend processing
- **Prisma ORM**: Type-safe database access with migrations
- **Tailwind v4**: Latest CSS-based configuration for better performance
- **Mock Responses**: Implemented for development without backend dependency

### Security Considerations
- **Authentication**: OAuth-only to prevent password management
- **API Validation**: All inputs validated before processing
- **CORS Configuration**: Restricted to known origins
- **Environment Variables**: Sensitive data kept out of codebase

## Common Issues and Troubleshooting

### Development Issues

#### n8n Webhook Not Responding
```bash
# Check if n8n is running
curl http://localhost:5678/n8n/healthz

# Test webhook directly
curl -X POST http://localhost:5678/webhook/[webhook-id] \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Verify workflow is activated in n8n UI
```

#### Database Connection Errors
```bash
# Test database connection
npx prisma db pull

# Reset database
npx prisma db push --force-reset

# Check PostgreSQL is running
psql -U postgres -h localhost
```

#### Authentication Issues
- Ensure `NEXTAUTH_SECRET` is set
- Check Google OAuth credentials are valid
- Verify `NEXTAUTH_URL` matches your development URL
- Clear browser cookies and try again

### Production Deployment Checklist
- [ ] Set production environment variables
- [ ] Configure PostgreSQL connection string
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Set up real Google OAuth credentials
- [ ] Configure CORS in n8n for production domain
- [ ] Run database migrations
- [ ] Set up monitoring and error tracking
- [ ] Configure rate limiting
- [ ] Enable HTTPS

## Future Enhancements

### Planned Features






3. **Advanced Search**: Full-text search across chat history
4. **Export Options**: PDF, Word, plain text exports
5. **Voice Input**: Speech-to-text for queries
6. **Multi-language Support**: Internationalization
7. **Analytics Dashboard**: Usage statistics and insights
8. **Custom AI Models**: Support for different legal AI models

### Architecture Improvements
1. **Microservices**: Separate chat, auth, and AI services
2. **Message Queue**: Redis/RabbitMQ for async processing
3. **Caching Layer**: Redis for frequently accessed data
4. **WebSockets**: Real-time bidirectional communication
5. **GraphQL API**: More efficient data fetching
6. **Service Workers**: Offline capability
7. **Edge Functions**: Improved global performance