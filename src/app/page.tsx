'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Send, User, LogOut, Scale, History, Wrench } from 'lucide-react';

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
  const [showHistory, setShowHistory] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Dynamic input sizing based on chat content
  const hasMessages = messages.length > 0; // Any messages present

  // Mock chat history for logged-in users
  const [chatHistory] = useState([
    'Contract law questions',
    'Employment regulations',
    'Intellectual property',
    'Business formation',
    'Real estate law'
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
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
    setIsLoading(false);

    // Mock streaming response
    let fullResponseText = 'Based on your question, here are the relevant legal considerations and precedents.';
    
    if (selectedTool === 'recursive-summary') {
      fullResponseText = 'Recursive Summary: Starting with fundamental legal principles, this matter involves multiple layers of jurisprudence. Key points: 1) Statutory framework applies 2) Case law supports specific interpretation 3) Regulatory compliance required. The recursive examination reveals interconnected legal concepts spanning constitutional law, statutory interpretation, and case precedents.';
    }

    // Stream the response text character by character
    let currentText = '';
    for (let i = 0; i < fullResponseText.length; i++) {
      currentText += fullResponseText[i];
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId 
            ? { ...msg, text: currentText }
            : msg
        )
      );
      
      // Add slight delay between characters for typing effect
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    // Add a small pause before streaming sources
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock sources from database
    const sources = [
      'https://example.com/case-law-smith-v-jones-2023',
      'https://example.com/statute-employment-act-section-12',
      'https://example.com/regulation-cfr-title-29-part-1630'
    ];

    // Stream sources one by one
    const currentSources: string[] = [];
    for (let i = 0; i < sources.length; i++) {
      currentSources.push(sources[i]);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId 
            ? { ...msg, references: [...currentSources] }
            : msg
        )
      );
      
      // Add delay between sources
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setSelectedTool(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Only for logged-in users */}
      {session && (
        <div className={`w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${showHistory ? '' : 'hidden lg:flex'}`}>
          {/* Logo Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Scale className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">AI Legal</h2>
                <p className="text-xs text-yellow-600 font-medium">Professional</p>
              </div>
            </div>
          </div>
          
          {/* Chat History */}
          <div className="p-4 flex-1">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3 text-gray-600">
                <History size={16} />
                <span className="font-medium text-sm">Chat History</span>
              </div>
              <div className="space-y-2">
                {chatHistory.map((chat, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors duration-200 truncate"
                  >
                    {chat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold" style={{ color: '#004A84' }}>AI Legal</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* History toggle for mobile logged-in users */}
              {session && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <History size={20} />
                </button>
              )}

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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
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
                      : 'border border-gray-200 text-gray-900'
                  }`}
                  style={
                    message.sender === 'user' 
                      ? { backgroundColor: '#226EA7' } 
                      : { backgroundColor: '#C7A562' }
                  }
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'user' && (
                      <User size={16} className="text-white mt-1 flex-shrink-0 order-2" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      
                      {/* Citation Display */}
                      {message.references && message.references.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-400">
                          <h4 className="text-xs font-semibold text-gray-800 mb-2">Sources:</h4>
                          <ol className="list-decimal list-inside space-y-1">
                            {message.references.map((ref, index) => (
                              <li key={index} className="text-xs text-gray-800">
                                {session ? (
                                  <a 
                                    href={ref} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-800 hover:text-blue-900 underline ml-1 transition-colors font-medium"
                                  >
                                    {ref}
                                  </a>
                                ) : (
                                  <span className="ml-1 text-gray-800">{ref}</span>
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
        <div className={`bg-white border-t border-gray-200 transition-all duration-500 ${
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
                className={`w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-500 text-gray-900 placeholder-gray-500 overflow-hidden ${
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
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Wrench size={hasMessages ? 16 : 20} />
                  </button>
                  
                  {/* Tools Dropdown */}
                  {showToolsDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                      <button
                        onClick={() => {
                          setSelectedTool(selectedTool === 'recursive-summary' ? null : 'recursive-summary');
                          setShowToolsDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          selectedTool === 'recursive-summary' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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
