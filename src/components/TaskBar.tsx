'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Plus, LogOut, User, Search } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar';
import { useSession, signIn, signOut } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

interface TaskBarProps {
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
}

export default function TaskBar({ onChatSelect, onNewChat }: TaskBarProps = {}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChatHistorySection, setShowChatHistorySection] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const taskBarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useSidebarStore();
  const { data: session } = useSession();

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (taskBarRef.current && !taskBarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (isExpanded || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded, showUserMenu]);

  // Fetch chat history for signed-in users
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

  // Get user initials
  const getUserInitials = () => {
    if (!session?.user?.name && !session?.user?.email) return '?';
    const name = session.user.name || session.user.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };


  return (
    <>
      {/* Taskbar */}
      <div
        ref={taskBarRef}
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 hide-scrollbar ${
          isDarkMode ? 'bg-[#1a1b1e] border-r border-gray-500' : 'bg-gray-50 border-r border-gray-300'
        }`}
        style={{
          width: isExpanded ? '280px' : '56px', // 56px ≈ 1.5cm
        }}
      >
        {/* Toggle Button and Header */}
        <div className="relative">
          <div className={`flex items-center ${isExpanded ? 'px-4' : 'px-2 justify-center'} py-4`}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 flex items-center justify-center transition-all duration-300 rounded-lg ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}
              style={{ color: isDarkMode ? '#d1d1d1' : '#004A84' }}
              aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
            >
              <Menu size={24} strokeWidth={2.5} />
            </button>
            {isExpanded && (
              <h1 className="ml-3 text-lg font-semibold" style={{ color: isDarkMode ? '#d1d1d1' : '#004A84' }}>
                AI Legal
              </h1>
            )}
          </div>
          
          {/* Divider line - positioned to align with AI Legal text */}
          <div className={`absolute left-0 right-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} style={{ 
            height: '1px',
            bottom: '0'
          }}></div>
        </div>

        {/* New Chat Button - Always Circular */}
        <div className={`flex items-center mt-4 ${isExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
          <button
            onClick={() => onNewChat ? onNewChat() : window.location.reload()}
            className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: isDarkMode ? 'transparent' : '#C7A562',
              border: isDarkMode ? '2px solid #d1d1d1' : 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
            }}
            onMouseEnter={(e) => {
              if (!isDarkMode) e.currentTarget.style.backgroundColor = '#B59552';
              else e.currentTarget.style.backgroundColor = 'rgba(209, 209, 209, 0.1)';
            }}
            onMouseLeave={(e) => {
              if (!isDarkMode) e.currentTarget.style.backgroundColor = '#C7A562';
              else e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="New Chat"
          >
            <Plus size={18} strokeWidth={3} style={{ color: isDarkMode ? '#ffffff' : '#004A84' }} />
          </button>
          {isExpanded && (
            <span 
              className="ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-300"
              style={{ color: isDarkMode ? '#ffffff' : '#004A84' }}
            >
              New Chat
            </span>
          )}
        </div>

        {/* Chat History Button - Speech Bubble with Clock */}
        <div className={`flex items-center mt-4 ${isExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
          <button
            onClick={() => {
              setIsExpanded(true);
              setShowChatHistorySection(!showChatHistorySection);
            }}
            className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:shadow-lg relative"
            style={{
              backgroundColor: isDarkMode ? 'transparent' : '#C7A562',
              border: isDarkMode ? '2px solid #d1d1d1' : 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
            }}
            onMouseEnter={(e) => {
              if (!isDarkMode) e.currentTarget.style.backgroundColor = '#B59552';
              else e.currentTarget.style.backgroundColor = 'rgba(209, 209, 209, 0.1)';
            }}
            onMouseLeave={(e) => {
              if (!isDarkMode) e.currentTarget.style.backgroundColor = '#C7A562';
              else e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Chat History"
          >
            {/* Speech Bubble SVG with Clock Hands */}
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              {/* Speech Bubble */}
              <circle cx="20" cy="18" r="16" fill={isDarkMode ? "#d1d1d1" : "#004A84"} />
              <path d="M 12 30 L 8 38 L 20 32" fill={isDarkMode ? "#d1d1d1" : "#004A84"} />
              
              {/* Clock Hands */}
              {/* Center dot */}
              <circle cx="20" cy="18" r="1.5" fill={isDarkMode ? "#1a1b1e" : "white"} />
              {/* Hour hand (12 o'clock) */}
              <rect x="19" y="10" width="2" height="8" fill={isDarkMode ? "#1a1b1e" : "white"} rx="1" />
              {/* Minute hand (4 o'clock) */}
              <rect x="19" y="17" width="2" height="10" fill={isDarkMode ? "#1a1b1e" : "white"} rx="1" 
                    transform="rotate(120 20 18)" />
            </svg>
          </button>
          {isExpanded && (
            <span 
              className="ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-300"
              style={{ color: isDarkMode ? '#ffffff' : '#004A84' }}
            >
              Chat History
            </span>
          )}
        </div>

        {/* Chat History Section - Shows when chat history button is clicked */}
        {isExpanded && showChatHistorySection && (
          <div className="flex-1 flex flex-col overflow-hidden mt-4">
            {/* Divider line */}
            <div className={`mx-3 mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} style={{ height: '1px' }}></div>
            
            {/* Chat History Header */}
            <div className="px-4 mb-3">
              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Chat History
              </h3>
            </div>

            {/* Search Bar */}
            {session && (
              <div className="px-4 mb-3">
                <div className="relative">
                  <Search size={16} className={`absolute left-3 top-2.5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-[#25262b] text-gray-200 placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Chat List or Sign In Message */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 hide-scrollbar">
              {!session ? (
                // Message for non-signed-in users
                <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className="text-sm">Sign in to save chats</p>
                </div>
              ) : chatHistory.length === 0 ? (
                // No chats found
                <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className="text-sm">
                    {chatSearchQuery ? 'No chats found' : 'No chat history yet'}
                  </p>
                </div>
              ) : (
                // Chat list
                <div className="space-y-2">
                  {chatHistory
                    .filter(chat => {
                      const searchLower = chatSearchQuery.toLowerCase();
                      const title = chat.title?.toLowerCase() || '';
                      const preview = chat.preview?.toLowerCase() || '';
                      return title.includes(searchLower) || preview.includes(searchLower);
                    })
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => {
                          if (onChatSelect) {
                            onChatSelect(chat.id);
                            setShowChatHistorySection(false);
                          } else {
                            window.location.href = `/?chat=${chat.id}`;
                          }
                        }}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-[#25262b] text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className={`text-sm font-medium truncate`}>
                          {chat.title || 'Untitled Chat'}
                        </div>
                        <div className={`text-xs mt-0.5 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Section - User Button */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Divider line */}
          <div className={`mx-3 mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} style={{ height: '1px' }}></div>
          
          <div className={`${isExpanded ? 'px-4' : 'px-2'} pb-4`}>
            
            {/* User/Auth Button */}
            <div className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              <div className="relative flex items-center" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: isDarkMode ? 'transparent' : '#C7A562',
                    border: isDarkMode ? '2px solid #ffffff' : 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDarkMode) e.currentTarget.style.backgroundColor = '#B59552';
                    else e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isDarkMode) e.currentTarget.style.backgroundColor = '#C7A562';
                    else e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label={session ? 'User menu' : 'Sign in'}
                >
                  <span className="text-base font-bold" style={{ color: isDarkMode ? '#d1d1d1' : '#004A84', fontStyle: 'normal' }}>
                    {session ? getUserInitials() : '?'}
                  </span>
                </button>
                {isExpanded && (
                  <button
                    onClick={() => {
                      if (session) {
                        setShowUserMenu(!showUserMenu);
                      } else {
                        signIn();
                      }
                    }}
                    className="ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-300 hover:underline cursor-pointer"
                    style={{ color: isDarkMode ? '#ffffff' : '#004A84' }}
                  >
                    {session ? (session.user?.name || session.user?.email || 'User') : 'Sign In'}
                  </button>
                )}

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className={`absolute bottom-full mb-2 ${isExpanded ? 'right-0' : 'left-0'} w-48 rounded-lg shadow-lg z-50 ${
                  isDarkMode ? 'bg-[#25262b]' : 'bg-white'
                }`}>
                  {session ? (
                    <>
                      <div className={`px-4 py-3`}>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {session.user?.name || session.user?.email}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {session.user?.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signIn();
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <User size={16} className="mr-2" />
                      Sign In
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

    </>
  );
}