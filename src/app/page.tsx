'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Send, User, LogOut, Scale, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import Sidebar from '@/components/Sidebar';
import DarkModeToggle from '@/components/DarkModeToggle';
import TaskBar from '@/components/TaskBar';
import { useSidebarStore } from '@/store/sidebar';

interface Message {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  references?: string[];
  timestamp: Date;
}

export default function LawyerChat() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isExpanded, toggleSidebar, isDarkMode } = useSidebarStore();
  
  // Dynamic input sizing based on chat content
  const hasMessages = messages.length > 0; // Any messages present

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on mount for logged-in users
  useEffect(() => {
    if (session?.user) {
      fetchChatHistory();
    }
  }, [session]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const createNewChat = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      if (response.ok) {
        const newChat = await response.json();
        setCurrentChatId(newChat.id);
        setMessages([]);
        await fetchChatHistory();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const chat = await response.json();
        setCurrentChatId(chatId);
        
        // Convert database messages to frontend format
        const convertedMessages = chat.messages.map((msg: any) => ({
          id: Date.now() + Math.random(),
          sender: msg.role as 'user' | 'assistant',
          text: msg.content,
          references: msg.references,
          timestamp: new Date(msg.createdAt)
        }));
        
        setMessages(convertedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          setMessages([]);
        }
        await fetchChatHistory();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const saveMessage = async (role: string, content: string, references: string[] = []) => {
    if (!session?.user || !currentChatId) return;
    
    try {
      await fetch(`/api/chats/${currentChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content, references })
      });
      
      // Update chat history to reflect new message
      await fetchChatHistory();
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Create new chat if needed (for logged-in users)
    if (session?.user && !currentChatId && messages.length === 0) {
      await createNewChat();
    }

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to database
    await saveMessage('user', inputText);
    
    setInputText('');
    setIsLoading(true);

    // Create empty assistant message for streaming
    const assistantId = Date.now() + 1;
    const assistantMessage: Message = {
      id: assistantId,
      sender: 'assistant',
      text: '',
      references: [],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Call the API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          tool: selectedTool,
          sessionId: session?.user?.email || 'anonymous',
          userId: session?.user?.email
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let currentText = '';
          let buffer = '';
          let sources: string[] = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            buffer += chunk;
            
            // Split by newlines and process each line
            const lines = buffer.split('\n');
            buffer = lines[lines.length - 1]; // Keep incomplete line in buffer
            
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'text') {
                    currentText += data.text;
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === assistantId 
                          ? { ...msg, text: currentText }
                          : msg
                      )
                    );
                  } else if (data.type === 'sources') {
                    sources = data.sources || [];
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === assistantId 
                          ? { ...msg, references: sources }
                          : msg
                      )
                    );
                  } else if (data.type === 'done') {
                    // Save the complete message
                    await saveMessage('assistant', currentText, sources);
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        }
      } else {
        // Handle regular JSON response
        const data = await response.json();
        
        // Update assistant message with response
        const assistantText = data.message || data.response || 'I received your message. Processing...';
        const assistantReferences = data.references || [];
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantId 
              ? { 
                  ...msg, 
                  text: assistantText, 
                  references: assistantReferences
                }
              : msg
          )
        );
        
        // Save assistant message to database
        await saveMessage('assistant', assistantText, assistantReferences);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update assistant message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId 
            ? { 
                ...msg, 
                text: 'I apologize, but I encountered an error processing your request. Please try again later or contact support if the issue persists.' 
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setSelectedTool(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#343541]' : 'bg-gray-50'}`}>
      {/* Universal TaskBar - Always visible for all users */}
      <TaskBar />
      
      {/* Sidebar - Only show for logged-in users */}
      {session?.user && (
        <Sidebar
          isExpanded={isExpanded}
          onToggleExpand={toggleSidebar}
          onNewChat={createNewChat}
          chats={chatHistory}
          currentChatId={currentChatId || undefined}
          onChatSelect={selectChat}
        />
      )}

      {/* Main Content - Adjust margin for taskbar and sidebar */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ml-[56px] ${session?.user && isExpanded ? 'md:ml-[316px]' : ''}`}>
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-[#202123] border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`} style={{ color: isDarkMode ? '#ffffff' : '#004A84' }}>AI Legal</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <DarkModeToggle />
              {status === 'loading' ? (
                <div className="text-gray-500">Loading...</div>
              ) : session ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:block">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: '#C7A562', color: '#004A84' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#B59552'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#C7A562'}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages Window */}
        <div className={`flex-1 overflow-y-auto px-6 py-4 space-y-6 ${isDarkMode ? 'bg-[#343541]' : ''}`}>
          {/* Welcome Message - Only show when no messages */}
          {messages.length === 0 && (
            <div className="flex items-start justify-center h-full pt-32">
              <h2 className="text-6xl font-medium" style={{ color: '#E1C88E' }}>Hi Welcome to AI Legal</h2>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message bubble */}
                <div
                  className={`px-4 py-3 rounded-lg shadow-sm ${
                    message.sender === 'user'
                      ? 'text-white'
                      : isDarkMode ? 'border border-gray-600 text-gray-100' : 'border border-gray-200 text-gray-900'
                  }`}
                  style={
                    message.sender === 'user' 
                      ? { backgroundColor: isDarkMode ? '#2A5490' : '#226EA7' } 
                      : { backgroundColor: isDarkMode ? '#B59552' : '#C7A562' }
                  }
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'user' && (
                      <User size={16} className="text-white mt-1 flex-shrink-0 order-2" />
                    )}
                    <div className="flex-1">
                      {message.sender === 'user' ? (
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      ) : (
                        <div className="text-sm leading-relaxed">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                            h1: ({children}) => <h1 className={`text-xl font-bold mb-3 mt-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{children}</h1>,
                            h2: ({children}) => <h2 className={`text-lg font-semibold mb-2 mt-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{children}</h2>,
                            h3: ({children}) => <h3 className={`text-base font-semibold mb-2 mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</h3>,
                            p: ({children}) => <p className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</p>,
                            ul: ({children}) => <ul className={`list-disc list-inside mb-2 space-y-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</ul>,
                            ol: ({children}) => <ol className={`list-decimal list-inside mb-2 space-y-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</ol>,
                            li: ({children}) => <li className="ml-2">{children}</li>,
                            strong: ({children}) => <strong className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{children}</strong>,
                            em: ({children}) => <em className="italic">{children}</em>,
                            code: ({children}) => <code className={`px-1 py-0.5 rounded text-sm font-mono ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>{children}</code>,
                            pre: ({children}) => <pre className={`p-3 rounded-lg overflow-x-auto mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>{children}</pre>,
                            blockquote: ({children}) => <blockquote className={`border-l-4 pl-4 italic my-2 ${isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-700'}`}>{children}</blockquote>,
                            hr: () => <hr className={`my-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />,
                            a: ({href, children}) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                              >
                                {children}
                              </a>
                            ),
                          }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      {/* Citation Display */}
                      {message.references && message.references.length > 0 && (
                        <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-400'}`}>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`${isDarkMode ? 'bg-[#40414f] border-gray-700' : 'bg-white border-gray-200'} border-t transition-all duration-500 ${
          hasMessages ? 'px-6 py-4' : 'px-16 py-8'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your legal question..."
                rows={1}
                className={`w-full border ${isDarkMode ? 'border-gray-600 bg-[#40414f] text-gray-100 placeholder-gray-400' : 'border-gray-300 text-gray-900 placeholder-gray-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-500 overflow-hidden ${
                  hasMessages 
                    ? 'px-4 py-3 pl-12 text-sm min-h-[44px]' 
                    : 'px-6 py-5 pl-14 text-lg min-h-[60px]'
                }`}
                style={{
                  height: 'auto',
                  maxHeight: hasMessages ? '120px' : '200px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, hasMessages ? 120 : 200)}px`;
                }}
                disabled={isLoading}
              />
              
              {/* Tools Button */}
              <div className={`absolute transition-all duration-500 ${
                hasMessages ? 'left-3 bottom-3' : 'left-4 bottom-5'
              }`}>
                <div className="relative">
                  <button
                    onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                    className={`p-1 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                    aria-label="Select tool"
                    title="Select tool"
                  >
                    <Wrench size={hasMessages ? 16 : 20} />
                  </button>
                  
                  {/* Tools Dropdown */}
                  {showToolsDropdown && (
                    <div className={`absolute bottom-full left-0 mb-2 w-48 ${isDarkMode ? 'bg-[#202123] border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-2 z-10`}>
                      <button
                        onClick={() => {
                          setSelectedTool(selectedTool === 'recursive-summary' ? null : 'recursive-summary');
                          setShowToolsDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          selectedTool === 'recursive-summary' 
                            ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'
                            : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Recursive Summary
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center space-x-2 transition-all duration-500 shadow-sm flex-shrink-0 ${
                hasMessages 
                  ? 'px-6 h-[44px]' 
                  : 'px-6 h-[44px]'
              }`}
              style={{ backgroundColor: '#C7A562', color: '#004A84' }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                if (!target.disabled) target.style.backgroundColor = '#B59552';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                if (!target.disabled) target.style.backgroundColor = '#C7A562';
              }}
            >
              <Send size={hasMessages ? 16 : 20} />
              <span className="hidden sm:block">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

