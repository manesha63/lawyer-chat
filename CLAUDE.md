# Lawyer Chat - AI Legal Assistant

## Overview
Lawyer Chat is a Next.js 15.3.3 web application providing an AI-powered chat interface for legal document queries. It integrates with n8n workflows and DeepSeek AI to deliver intelligent legal assistance with document citations.

## Tech Stack
- **Frontend**: Next.js 15.3.3, React 19, TypeScript, Tailwind CSS v4
- **Auth**: NextAuth.js with Google OAuth (JWT sessions)
- **Database**: PostgreSQL with Prisma ORM
- **State**: Zustand with persistence
- **AI Integration**: n8n webhooks → DeepSeek R1 model
- **UI Libraries**: Lucide icons, React Markdown, date-fns, remark-gfm

## Architecture

### Data Flow
```
User → Next.js App → API Route → n8n Webhook → DeepSeek AI → Response Streaming → UI
                          ↓                           ↓
                     PostgreSQL ← ─────────────────────┘
```

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (TaskBar, Sidebar, DarkMode, CitationPanel)
- `src/store/` - Zustand state management (sidebar, dark mode)
- `src/utils/` - Utilities (mock citations for development)
- `prisma/` - Database schema and migrations

## ✅ Completed Features

### Frontend (90% Complete)
- **Chat Interface**: Streaming responses, markdown support, welcome screen
- **TaskBar**: Universal navigation with chat history, search, time grouping
- **Responsive Design**: Dynamic sizing system with proportional scaling
- **Dark Mode**: Complete theme implementation with CSS variables
- **Professional Theme**: Legal colors (#004A84 blue, #C7A562 gold)
- **Guest Mode**: Full functionality without authentication
- **Tools UI**: Multi-select dropdown with Page Turn & Analytics
- **Tool Chips**: Visual indicators with removal option
- **Citation UI**: Button and panel with mock data
- **Analytics Modal**: Centered overlay with gold theme matching citation styling

### Backend APIs (Structure Complete, Need Configuration)
- **Chat API**: Streaming support, n8n webhook integration
- **Authentication**: NextAuth with Google OAuth setup
- **Chat Management**: CRUD operations for chats/messages
- **Database Schema**: Complete Prisma models

## 🔧 Half-Implemented Features

### Authentication System
- ✅ NextAuth configuration with routes
- ✅ Google OAuth provider setup
- ❌ Using JWT instead of database sessions
- ❌ Demo credentials instead of real ones
- **Fix**: Configure Prisma adapter, add real Google OAuth credentials

### Database Integration  
- ✅ Prisma schema with all models
- ✅ Database client configuration
- ❌ No DATABASE_URL configured
- ❌ Migrations not run
- **Fix**: Set up PostgreSQL, run `npx prisma db push`

### Chat Persistence
- ✅ API routes for saving/loading chats
- ✅ Authorization checks
- ❌ Requires database connection
- **Fix**: Complete database setup above

## 📱 Frontend-Only Features (Need Backend)

### Citation System
- ✅ Frontend displays citations perfectly
- ✅ CitationPanel with download functionality
- ❌ Using mock data (3 legal cases)
- ❌ No real document links from n8n/Haystack
- **Integration**: Connect to Haystack for real document references

### Tools Processing
- ✅ UI for Page Turn and Analytics selection
- ✅ Tools sent in API payload
- ❌ No backend workflow implementation
- **Integration**: Create n8n sub-workflows for each tool

### Search Enhancement
- ✅ Frontend filters loaded chats
- ❌ No backend search API
- **Future**: Add full-text search with Elasticsearch

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

## Tool Integration Architecture

### Overview
The lawyer-chat application supports multiple AI tools that trigger specific n8n workflows:
- **Page Turn**: Page-by-page document processing for precise legal answers
- **Analytics**: Data aggregation and trend analysis for document sets

### Frontend Implementation (✅ Completed)
1. **Multi-tool Selection**: Users can select multiple tools via dropdown
2. **Tool Chips**: Selected tools display as removable chips at input bottom
3. **API Payload**: Sends `tools` array instead of single `tool` string

### Backend Integration Plan

#### Phase 1: Update API Route (✅ Completed)
```javascript
// Current payload structure
{
  "message": "user query",
  "tools": ["page-turn", "analytics"], // Array of selected tools
  "sessionId": "user@email or anonymous",
  "timestamp": "ISO 8601",
  "metadata": { "userAgent", "origin" }
}
```

#### Phase 2: n8n Workflow Architecture
```
Main Webhook → Tool Router → Tool-Specific Workflows → Response Merger
                    ↓
            Check tools array:
              - Contains 'page-turn' → Page Turn Workflow
              - Contains 'analytics' → Analytics Workflow
              - Empty/default → Standard Chat Workflow
```

#### Phase 3: Tool Workflow Implementation

##### Page Turn Workflow
1. **Purpose**: Process documents page-by-page for precise answers
2. **Implementation**:
   ```
   Input → Haystack Search (page-level) → Recursive Summary → AI Processing → Response
   ```
3. **Key Features**:
   - Uses document hierarchy for navigation
   - Maintains page context
   - No separate output stream - integrated into main response

##### Analytics Workflow
1. **Purpose**: Generate data insights and trends from document sets
2. **Implementation**:
   ```
   Input → Elasticsearch Query → Data Aggregation → Trend Analysis → Response + Data
   ```
3. **Key Features**:
   - Batch document processing
   - Statistical analysis
   - Returns additional structured data

#### Phase 4: n8n Configuration Steps

1. **Create Tool Router (IF Node)**:
   ```javascript
   // After webhook node
   Expression: {{ $json.body.tools.includes('page-turn') }}
   TRUE → Execute Page Turn Sub-workflow
   FALSE → Continue
   
   Expression: {{ $json.body.tools.includes('analytics') }}
   TRUE → Execute Analytics Sub-workflow
   FALSE → Default processing
   ```

2. **Configure Sub-workflows**:
   - Each tool has dedicated workflow
   - Workflows can run in parallel if multiple tools selected
   - Results merge before streaming response

3. **Response Structure**:
   ```javascript
   {
     "response": "Main answer text...",
     "analytics": {
       // Only present if analytics tool used
       "trends": [...],
       "statistics": {...},
       "charts": [...]
     },
     "sources": [...],
     "toolsUsed": ["page-turn", "analytics"]
   }
   ```

#### Phase 5: Frontend Response Handling

1. **Parse Enhanced SSE Stream**:
   ```javascript
   // Handle analytics data
   if (data.type === 'analytics') {
     displayAnalytics(data.analytics);
   }
   ```

2. **UI Updates**:
   - Show active tools indicator during processing
   - Display analytics in expandable section
   - Maintain citation functionality

### Implementation Timeline

1. **Week 1**: 
   - Set up n8n tool router workflow
   - Create Page Turn sub-workflow with Haystack integration
   
2. **Week 2**:
   - Implement Analytics sub-workflow
   - Add response merging logic
   - Test multi-tool combinations

3. **Week 3**:
   - Frontend analytics display components
   - Performance optimization
   - Error handling for tool failures

### Future Tool Additions

To add new tools:
1. Add tool to frontend dropdown
2. Create n8n sub-workflow
3. Add routing condition in main workflow
4. Update response handler if needed

### Testing Strategy

1. **Single Tool Tests**:
   - Page Turn only: Verify page-specific responses
   - Analytics only: Check data aggregation

2. **Multi-Tool Tests**:
   - Both tools selected: Ensure proper merging
   - Performance with multiple workflows

3. **Error Scenarios**:
   - Tool workflow failures
   - Timeout handling
   - Graceful degradation

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
- Character streaming with 30ms delay (2 chars per chunk)
- Guest mode with progressive enhancement
- Dynamic responsive sizing engine (calculateResponsiveSizing function)
- Mock citation system for development (3 detailed legal cases)

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
- **Focus Ring**: `rgba(255, 255, 255, 0.5)` - Greyish white for input/search focus

### Usage Patterns
- **Headers/Navigation**: Blue (#004A84) in light, white in dark
- **Buttons**: Gold (#C7A562) in light, transparent with borders in dark
- **Messages**: Blue bubbles for user, gold for assistant
- **Interactive Hover**: Darker shade variations (~10-15% darker)

### Button Hover Effects
- **Light Mode**: All buttons use `#B59552` on hover (TaskBar buttons, send button)
- **Light Mode Citation**: Uses `#C8A665` on hover (lighter, 0.8x strength)
- **Light Mode Analytics**: Uses `#C8A665` on hover (matches citation button)
- **Dark Mode**: All buttons use `#404147` on hover (unified across all interactive elements)
- **Dark Mode Base**: Buttons start transparent with borders, hover adds solid background

### Analytics Modal Styling
- **Light Mode**: Gold-themed borders (#E1C88E), cream backgrounds (#FBF7F1), blue text (#004A84)
- **Dark Mode**: Standard dark theme with gray borders and backgrounds
- **Positioning**: Centered overlay with semi-transparent backdrop
- **Scrollbar**: Custom styled scrollbar with theme-appropriate colors

## Responsive Design System

### Dynamic Sizing Engine
Located in `src/app/page.tsx` (calculateResponsiveSizing function):
- **Proportional scaling** based on TaskBar width (280px expanded, 56px collapsed)
- **Citation panel integration** (400px width when open)
- **Minimum thresholds** for readability (320px min assistant width, 14px min font)
- **Input area scaling** with sqrt ratios for less aggressive scaling
- **Button/icon scaling** with proportional sizing

### Key Calculations
- **Message padding**: Proportional with 19px minimum (0.5cm)
- **Input padding**: Proportional with 38px minimum (1cm)
- **Assistant width**: 1.3x larger than base (672px), responsive to available space
- **Font sizes**: 14-18px range with dynamic scaling

## Account Button

The account button is located at the bottom of the TaskBar and handles authentication:
- **Guest Mode**: Shows "?" icon with "Guest/Not signed in" text
- **Signed In**: Shows user avatar/initial with name and "Signed in" status
- **Click Action**: Opens dropdown menu above button
- **Guest Menu**: "Sign in to your account" option triggers Google OAuth
- **User Menu**: Shows email and "Sign out" option
- **Positioning**: Always visible, menu appears above with min-width 200px
- **Authentication**: Handled via NextAuth.js with Google OAuth
- **Benefits**: Signed-in users get chat history and clickable citations

## Implementation Status

### ✅ Production Ready
- Complete responsive design system with dynamic calculations
- Universal TaskBar with time-grouped chat history
- Advanced dark mode with CSS custom properties  
- Message layout with precise spacing (12.48px/14.144px padding)
- Citation system with mock data for development
- Streaming responses with 30ms character delay
- Guest mode with progressive enhancement

### ⚠️ Development Features
- **Mock Citations**: 3 detailed legal cases in `src/utils/mockCitations.ts`
- **Test Scripts**: `test-api.js` and `test-webhook.js` for API testing
- **JWT Sessions**: Temporary solution, migrate to database sessions

### 🔧 Key Files
- `src/app/page.tsx` - Main chat interface (700+ lines)
- `src/components/TaskBar.tsx` - Universal navigation system
- `src/app/globals.css` - Dark mode CSS custom properties
- `src/store/sidebar.ts` - Zustand state management

## Troubleshooting

### Common Issues
1. **Webhook not responding**: Check n8n is running and workflow activated
2. **Auth failing**: Verify NEXTAUTH_SECRET and Google OAuth credentials
3. **Database errors**: Ensure PostgreSQL is running and migrations applied
4. **Chat not streaming**: Verify webhook URL in .env.local
5. **Layout issues**: Check responsive calculations in calculateResponsiveSizing function

### Production Checklist
- [ ] Real OAuth credentials
- [ ] Database migrations  
- [ ] Replace mock citations with real Haystack integration
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error monitoring setup