# Lawyer Chat - AI-Powered Legal Assistant

## 🚀 Overview

Lawyer Chat is a modern web application that provides an AI-powered chat interface for legal document queries. Built with Next.js 15 and integrated with n8n workflows and DeepSeek AI, it delivers intelligent legal assistance with document citations and advanced analysis tools.

## 🎯 Key Features

- **AI-Powered Chat**: Real-time streaming responses with legal expertise
- **Document Citations**: Automatic source attribution for legal accuracy
- **Multi-Tool Support**: Page Turn and Analytics tools for comprehensive analysis
- **Dark Mode**: Professional theme with legal industry colors
- **Guest Mode**: Full functionality without authentication
- **Chat History**: Persistent conversations with time-based grouping
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.3, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand with persistence
- **AI Integration**: n8n webhooks → DeepSeek R1 model
- **UI Components**: Lucide icons, React Markdown, date-fns

## 📁 Project Structure

```
lawyer-chat/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # NextAuth endpoints
│   │   │   ├── chat/       # Chat streaming endpoint
│   │   │   └── chats/      # Chat management CRUD
│   │   ├── globals.css     # Global styles & themes
│   │   └── page.tsx        # Main chat interface
│   ├── components/         # React components
│   │   ├── TaskBar.tsx     # Universal navigation
│   │   ├── Sidebar.tsx     # Chat history sidebar
│   │   ├── DarkMode.tsx    # Theme switcher
│   │   └── CitationPanel.tsx # Document citations
│   ├── store/              # Zustand state
│   │   ├── sidebar.ts      # Sidebar state
│   │   └── darkMode.ts     # Theme state
│   └── utils/              # Utilities
│       └── mockCitations.ts # Development citations
├── prisma/
│   └── schema.prisma       # Database models
├── public/                 # Static assets
└── package.json           # Dependencies
```

## 🔄 Architecture & Workflow

### Data Flow
```
User Input → Next.js App → API Route → n8n Webhook → DeepSeek AI
     ↑                          ↓                          ↓
     ←── UI Update ←── Response Streaming ←── PostgreSQL ←─┘
```

### n8n Integration Flow

1. **User Message**: Sent to `/api/chat` endpoint
2. **API Processing**: Validates and enriches payload
3. **n8n Webhook**: Processes with AI workflow
4. **Response Streaming**: Real-time character-by-character display
5. **Database Storage**: Saves chat history for authenticated users

### Request Payload Structure
```json
{
  "message": "user query",
  "tools": ["page-turn", "analytics"],
  "sessionId": "user@email or anonymous",
  "timestamp": "ISO 8601",
  "metadata": {
    "userAgent": "browser info",
    "origin": "request origin"
  }
}
```

## 🚦 Project Status

### ✅ Completed (90%)
- Full chat interface with streaming
- Dark mode with professional theme
- Guest mode functionality
- Multi-tool selection UI
- Citation display system
- Responsive design
- API structure

### 🔧 In Progress
- Database connection setup
- Real Google OAuth credentials
- n8n webhook configuration
- Tool workflow implementation

### 📋 Pending
- Haystack integration for real citations
- Analytics tool backend
- Full-text search
- Export functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- n8n instance (for AI integration)
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/manesha63/lawyer-chat.git
cd lawyer-chat
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lawyerchat

# n8n Integration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/your-webhook-id
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to see the application.

## 🔌 API Endpoints

### Chat Operations
- `POST /api/chat` - Send message to AI (streaming response)
- `GET /api/chat` - Health check

### Chat Management (Requires Auth)
- `GET /api/chats` - List user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/[id]` - Get chat with messages
- `DELETE /api/chats/[id]` - Delete chat
- `POST /api/chats/[id]/messages` - Save message

## 🎨 UI Features

### Color Scheme
- **Primary Blue**: #004A84 (Headers, text, buttons)
- **Gold Accent**: #C7A562 (CTAs, primary buttons)
- **Dark Mode**: Custom palette with #1a1b1e background

### Components
- **TaskBar**: Collapsible navigation with chat history
- **Chat Interface**: Real-time streaming with markdown support
- **Citation Panel**: Document references with download options
- **Tool Selection**: Multi-select dropdown for AI tools

## 🧪 Testing

```bash
# Test API endpoint
node test-api.js

# Test n8n webhook integration
node test-webhook.js
```

## 🚧 Known Issues

1. **Authentication**: Currently using JWT sessions (should migrate to database sessions)
2. **Citations**: Using mock data (needs Haystack integration)
3. **Tools**: Backend workflows not implemented
4. **Database**: Requires PostgreSQL setup and configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [DeepSeek](https://deepseek.com/) via n8n
- UI components from [Lucide](https://lucide.dev/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)

---

For more detailed technical documentation, please refer to the project wiki or contact the development team.