# Lawyer Chat - Data Compose Frontend

## Project Overview and Purpose

Lawyer Chat is the web frontend interface for Data Compose, a sophisticated legal document processing platform. This Next.js application provides legal professionals with an AI-powered chat interface to interact with large-scale judicial and legal document collections.

### Key Features
- **AI Chat Interface**: Real-time conversation with DeepSeek R1 model
- **Document Citations**: Assistant responses include legal document references
- **User Authentication**: NextAuth integration with PostgreSQL
- **Responsive Design**: Modern SPA with tab-based navigation
- **Legal Focus**: Specialized for judicial and legal document analysis

## Key Architecture Decisions

### Frontend Stack
- **Next.js 15.3.3** with TypeScript for SSR and modern React features
- **Tailwind CSS v4** for styling (CSS-based configuration)
- **NextAuth v4** for authentication and session management
- **Prisma** as ORM for PostgreSQL database integration

### Integration Architecture
```
User → Next.js Chat UI → Next.js API Routes → n8n Workflows → DeepSeek AI/Haystack Search → Response
```

### Backend Integration Strategy
- Next.js API routes act as middleware layer
- HTTP webhooks to communicate with existing n8n workflows
- n8n handles AI processing and document search
- Existing Data Compose services remain unchanged

### Database Design
- PostgreSQL for user sessions and chat history
- Prisma adapter for NextAuth integration
- Chat messages stored with user context and citations

## Current Implementation Status

### ✅ Completed Features
- [x] **Project Foundation**:
  - Next.js 15.3.3 with TypeScript and strict mode
  - Tailwind CSS v4 with CSS-based configuration
  - All dependencies correctly installed and configured
  - ESLint and PostCSS properly set up

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

- [x] **Environment Configuration**:
  - Complete `.env.local` with all required variables
  - NextAuth, database, Google OAuth, and n8n URLs configured
  - Development environment ready

### ⚠️ Partially Implemented
- [x] **Authentication (70% complete)**:
  - NextAuth functional but using JWT sessions instead of database persistence
  - Prisma adapter dependency installed but not configured in NextAuth
  - Google OAuth ready but needs real credentials

- [x] **Mock AI Integration (UI Ready)**:
  - Frontend chat interface fully functional
  - Mock streaming responses with realistic typing effects
  - Tool selection affects response content
  - Citations display system implemented
  - **Missing**: Real n8n integration and AI model connection

### ❌ Critical Missing Components

#### **🔥 High Priority (Blocks Core Functionality)**
- [ ] **API Routes**: `/src/app/api/chat/route.ts` for n8n webhook integration
- [ ] **Database Integration**: Fix NextAuth to use Prisma adapter for persistence
- [ ] **Real AI Connection**: Replace mock responses with actual DeepSeek R1 via n8n
- [ ] **Message Persistence**: Save chat history to PostgreSQL database

#### **⚠️ Medium Priority (Essential Features)**
- [ ] **Error Handling**: Error boundaries and user feedback systems
- [ ] **Chat History Loading**: Retrieve and display previous conversations
- [ ] **Real Document Search**: Integration with Haystack API for legal citations
- [ ] **Production Database**: Set up PostgreSQL and run Prisma migrations

#### **📈 Lower Priority (User Experience)**
- [ ] **Multiple Chat Sessions**: Support for creating new conversations
- [ ] **Advanced Legal Tools**: Case Analysis, Document Review features
- [ ] **Performance Optimization**: Handle large chat histories efficiently
- [ ] **Accessibility**: WCAG compliance improvements

## Next Implementation Steps

### 🎯 **Phase 1: Core Backend Integration** (Week 1)

#### **1. Fix Database Integration** 
```bash
# Required tasks:
1. Update NextAuth config to use Prisma adapter
2. Set up PostgreSQL database locally/cloud
3. Run Prisma migrations: `npx prisma db push`
4. Test authentication with database persistence
```

#### **2. Create Chat API Route**
```typescript
// Create: /src/app/api/chat/route.ts
- Handle POST requests from chat interface
- Forward queries to n8n webhook
- Stream responses back to frontend
- Handle errors and timeouts
```

#### **3. n8n Webhook Integration**
```bash
# Integration points:
- Chat endpoint: POST to n8n workflow
- Document search: Haystack API integration
- Response streaming: Server-sent events or WebSocket
- Error handling: Fallback responses
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
1. **Set up PostgreSQL database** - local or cloud instance
2. **Fix NextAuth Prisma adapter** - enable database sessions
3. **Create `/api/chat` endpoint** - connect to n8n webhooks
4. **Test real AI integration** - replace mock responses

### **💡 Architecture Decisions Made:**
- Single-page chat interface (not `/chat` route)
- JWT sessions temporarily (should switch to database)
- Mock streaming implementation (ready for real backend)
- Custom color scheme (#004A84, #C7A562) implemented
- Responsive design with auth-gated features

### **⚠️ Technical Debt:**
- NextAuth configuration inconsistency (JWT vs database)
- Mock responses instead of real AI integration
- Missing error handling throughout application
- No automated testing infrastructure

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

## Environment Setup Notes

- Using Tailwind CSS v4 (CSS-based configuration)
- PostCSS configuration already present
- ESLint configured for Next.js
- TypeScript strict mode enabled
- Lucide React icons for professional legal UI
- Complete chat interface ready for testing at `/chat`

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