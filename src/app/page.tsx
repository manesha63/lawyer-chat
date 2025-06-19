'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Sidebar from '@/components/Sidebar';
import DarkModeToggle from '@/components/DarkModeToggle';
import TaskBar from '@/components/TaskBar';
import CitationPanel from '@/components/CitationPanel';
import { useSidebarStore } from '@/store/sidebar';
import { getRandomMockCitation } from '@/utils/mockCitations';

interface Message {
  id: number;
  sender: 'user' | 'assistant';
  text: string;
  references?: string[];
  timestamp: Date;
}

export default function LawyerChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showCitationPanel, setShowCitationPanel] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<any>(null);
  const [windowWidth, setWindowWidth] = useState(1440); // Default value for SSR
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isExpanded, toggleSidebar, isDarkMode, isTaskBarExpanded } = useSidebarStore();
  
  // Dynamic input sizing based on chat content
  const hasMessages = messages.length > 0; // Any messages present

  // Track window resize and set initial width after hydration
  useEffect(() => {
    // Set initial width after component mounts (client-side only)
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic sizing based on window width and panel states
  const calculateResponsiveSizing = () => {
    // Calculate available width
    const taskBarWidth = isTaskBarExpanded ? 280 : 56;
    const citationWidth = showCitationPanel ? 400 : 0;
    const availableWidth = windowWidth - taskBarWidth - citationWidth;
    
    // Calculate proportional values based on available space
    // Base values for full desktop (1920px)
    const baseWidth = 1920;
    const baseAvailable = baseWidth - 56; // Base with collapsed taskbar
    const spaceRatio = availableWidth / baseAvailable;
    
    // Proportional padding calculation
    const baseMsgPadding = 95; // ~2.5cm in pixels
    const baseInputPadding = 113; // ~3cm in pixels
    
    // Scale padding proportionally but with minimum values
    let messagePadding = Math.max(19, Math.min(baseMsgPadding, baseMsgPadding * spaceRatio)); // Min 0.5cm, max 2.5cm
    let inputPadding = Math.max(38, Math.min(baseInputPadding, baseInputPadding * spaceRatio)); // Min 1cm, max 3cm
    
    // Input box sizing
    const baseInputHeight = 125;
    const baseMaxHeight = 260;
    let inputHeight = Math.max(80, Math.min(baseInputHeight, baseInputHeight * Math.sqrt(spaceRatio))); // Use sqrt for less aggressive scaling
    let maxInputHeight = Math.max(160, Math.min(baseMaxHeight, baseMaxHeight * Math.sqrt(spaceRatio)));
    
    // Font size scaling
    const baseFontSize = 18; // text-lg is ~18px
    let fontSize = Math.max(14, Math.min(baseFontSize, baseFontSize * Math.sqrt(spaceRatio)));
    
    // Max width calculation
    let maxWidth = availableWidth > 1200 ? '57.6rem' : availableWidth > 800 ? '48rem' : '100%';
    
    // Special handling for very small spaces
    if (availableWidth < 500) {
      messagePadding = 19; // 0.5cm
      inputPadding = 19; // 0.5cm
      inputHeight = 80;
      maxInputHeight = 160;
      fontSize = 14;
      maxWidth = '100%';
    }
    
    // Calculate dynamic button sizing and positioning
    const baseButtonSize = 32; // Base button size at full scale
    const baseIconSize = 24; // Base icon size
    const buttonSize = Math.max(24, Math.min(baseButtonSize, baseButtonSize * Math.sqrt(spaceRatio)));
    const iconSize = Math.max(16, Math.min(baseIconSize, baseIconSize * Math.sqrt(spaceRatio)));
    const sendButtonSize = buttonSize * 1.3; // Send button 1.3x larger
    const sendIconSize = Math.round(iconSize * 1.3); // Scale icon proportionally
    const buttonPadding = Math.max(12, 16 * spaceRatio); // Dynamic padding from edges
    const sendButtonBottom = buttonPadding * 1.5; // Send button slightly higher for visual balance
    
    return {
      messagePadding: `${messagePadding}px`,
      inputPadding: `${inputPadding}px`,
      inputHeight: `${inputHeight}px`,
      maxInputHeight: `${maxInputHeight}px`,
      fontSize: `${fontSize}px`,
      maxWidth,
      buttonSize: `${buttonSize}px`,
      iconSize: Math.round(iconSize),
      sendButtonSize: `${sendButtonSize}px`,
      sendIconSize,
      buttonPadding: `${buttonPadding}px`,
      sendButtonBottom: `${sendButtonBottom}px`
    };
  };

  const { messagePadding, inputPadding, inputHeight, maxInputHeight, fontSize, maxWidth, buttonSize, iconSize, sendButtonSize, sendIconSize, buttonPadding, sendButtonBottom } = calculateResponsiveSizing();

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

  const handleCitationClick = (messageId: number) => {
    // Get a mock citation for now
    const mockCitation = getRandomMockCitation();
    setSelectedCitation(mockCitation);
    setShowCitationPanel(true);
  };

  const closeCitationPanel = () => {
    setShowCitationPanel(false);
    setSelectedCitation(null);
  };


  return (
    <div className="flex h-screen">
      {/* Universal TaskBar - Always visible for all users */}
      <TaskBar 
        onChatSelect={selectChat}
        onNewChat={createNewChat}
      />
      
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

      {/* Main Content Container - Adjust margin for taskbar and sidebar */}
      <div className={`flex-1 flex transition-all duration-300 ${isTaskBarExpanded ? 'ml-[280px]' : 'ml-[56px]'} ${session?.user && isExpanded ? 'md:ml-[316px]' : ''}`}>
        {/* Chat Section */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${showCitationPanel ? 'w-1/2' : 'w-full'}`}>
        {/* Header */}
        <div className={`px-6 py-4 relative z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!isTaskBarExpanded && (
                <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`} style={{ color: isDarkMode ? '#ffffff' : '#004A84' }}>AI Legal</h1>
              )}
            </div>
            
            <div className="flex items-center relative z-50">
              <DarkModeToggle />
            </div>
          </div>
        </div>

        {/* Messages Window */}
        <div className="flex-1 overflow-x-hidden py-4 space-y-6 hide-scrollbar relative" style={{
          overflowY: messages.length === 0 ? 'hidden' : 'auto',
          paddingLeft: messagePadding,
          paddingRight: messagePadding
        }}>
          {/* Welcome Message - Only show when no messages */}
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-full mx-auto" style={{
                maxWidth: maxWidth,
                paddingLeft: inputPadding,
                paddingRight: inputPadding,
              }}>
                <h2 className="font-medium text-center" style={{ 
                  color: isDarkMode ? '#9CA3AF' : '#E1C88E',
                  fontSize: '2.52rem', // 3.6rem (text-6xl) * 0.7
                  marginBottom: 'calc(125px + 2cm + 3cm)' // Input height (125px) + 2cm gap + 3cm additional
                }}>Hi Welcome to AI Legal</h2>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`${message.sender === 'user' ? 'order-2 max-w-xl' : 'order-1'}`}>
                {/* Message bubble */}
                <div
                  className={`${
                    message.sender === 'user'
                      ? 'px-4 py-3 rounded-lg shadow-sm text-white inline-block'
                      : isDarkMode ? 'text-gray-100 max-w-2xl' : 'text-gray-900 max-w-2xl'
                  }`}
                  style={
                    message.sender === 'user' 
                      ? { backgroundColor: isDarkMode ? '#2a2b2f' : '#226EA7' } 
                      : {}
                  }
                >
                  <div>
                    <div>
                      {message.sender === 'user' ? (
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      ) : (
                        <div className="text-sm leading-relaxed markdown-list">
                          {message.text === '' && isLoading && message.id === messages[messages.length - 1].id ? (
                            <div className={`loading-dots ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          ) : (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                            h1: ({children}) => <h1 className={`text-xl font-bold mb-3 mt-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{children}</h1>,
                            h2: ({children}) => <h2 className={`text-lg font-semibold mb-2 mt-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{children}</h2>,
                            h3: ({children}) => <h3 className={`text-base font-semibold mb-2 mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</h3>,
                            p: ({children}) => <p className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</p>,
                            ul: ({children}) => <ul className={`list-disc ml-6 mb-3 space-y-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</ul>,
                            ol: ({children}) => <ol className={`list-decimal ml-6 mb-3 space-y-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</ol>,
                            li: ({children}) => (
                              <li className="leading-relaxed">
                                <span className="inline-block ml-2">{children}</span>
                              </li>
                            ),
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
                          )}
                        </div>
                      )}
                      
                      {/* Citation Link - Show only after response is complete */}
                      {message.sender === 'assistant' && message.text && !(isLoading && message.id === messages[messages.length - 1].id) && (
                        <div className={`mt-3 inline-block`}>
                          <button
                            onClick={() => handleCitationClick(message.id)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 transform active:scale-95 ${
                              isDarkMode 
                                ? 'bg-[#25262b] text-[#d1d1d1] border border-[#d1d1d1] hover:bg-[rgba(209,209,209,0.1)] active:bg-[rgba(209,209,209,0.2)]' 
                                : 'bg-[#C7A562] text-[#004A84] hover:bg-[#B59552] active:bg-[#A08442]'
                            }`}
                            style={{
                              fontSize: '1.092rem', // 1.3x of text-sm (0.875rem × 1.3 = 1.1375rem)
                              fontWeight: '600',
                              letterSpacing: '0.05em'
                            }}
                          >
                            CITATIONS
                          </button>
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
        <div className={`transition-all duration-500 ${
          hasMessages 
            ? 'px-6 py-4 flex justify-center' 
            : 'absolute inset-0 flex items-center justify-center'
        }`} style={{
          left: hasMessages ? 'auto' : isTaskBarExpanded ? '280px' : '56px',
          right: hasMessages ? 'auto' : '0'
        }}>
          <div className="w-full mx-auto" style={{
            maxWidth: maxWidth,
            paddingLeft: inputPadding,
            paddingRight: inputPadding,
          }}>
            <div className="relative">
              <textarea
                ref={textareaRef}
                id="chat-input"
                name="chatInput"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your legal question..."
                className={`w-full ${isDarkMode ? 'bg-[#25262b] text-gray-100 placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-500 px-4 py-6 pl-9 pr-9 break-words hide-scrollbar`}
                style={{
                  height: inputHeight,
                  maxHeight: maxInputHeight,
                  fontSize: fontSize,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = inputHeight;
                  const scrollHeight = target.scrollHeight;
                  const maxHeight = parseInt(maxInputHeight);
                  target.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
                }}
                disabled={isLoading}
              />
              
              {/* Tools Button */}
              <div className="absolute transition-all duration-500" style={{ 
                left: buttonPadding, 
                bottom: buttonPadding 
              }}>
                <div className="relative">
                  <button
                    onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                    className={`flex items-center justify-center ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                    aria-label="Select tool"
                    title="Select tool"
                    style={{
                      width: buttonSize,
                      height: buttonSize
                    }}
                  >
                    <Wrench size={iconSize} />
                  </button>
                  
                  {/* Tools Dropdown */}
                  {showToolsDropdown && (
                    <div className={`absolute bottom-full left-0 mb-2 w-48 ${isDarkMode ? 'bg-[#25262b]' : 'bg-white'} rounded-lg shadow-lg py-2 z-10`}>
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
              
              {/* Send Button - Inside input box */}
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                aria-label="Send message"
                title="Send message"
                className={`absolute transition-all duration-300 rounded-lg flex items-center justify-center ${
                  inputText.trim() 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-0 pointer-events-none'
                }`}
                style={{ 
                  backgroundColor: isDarkMode ? 'transparent' : '#C7A562',
                  border: isDarkMode ? '2px solid #d1d1d1' : 'none',
                  color: isDarkMode ? '#d1d1d1' : '#004A84',
                  right: buttonPadding,
                  bottom: sendButtonBottom,
                  width: sendButtonSize,
                  height: sendButtonSize
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  if (!target.disabled) {
                    if (!isDarkMode) target.style.backgroundColor = '#B59552';
                    else target.style.backgroundColor = 'rgba(209, 209, 209, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  if (!target.disabled) {
                    if (isDarkMode) target.style.backgroundColor = 'transparent';
                    else target.style.backgroundColor = '#C7A562';
                  }
                }}
              >
                <Send size={sendIconSize} />
              </button>
            </div>
          </div>
        </div>
        </div>
        
        {/* Citation Panel */}
        {showCitationPanel && selectedCitation && (
          <div className="flex-1 h-full">
            <CitationPanel
              citation={selectedCitation}
              onClose={closeCitationPanel}
            />
          </div>
        )}
      </div>
    </div>
  );
}

