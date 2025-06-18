'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Plus, X, LogOut, User, Search, ChevronRight } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar';
import { useSession, signIn, signOut } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

export default function TaskBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const taskBarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
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
      if (chatHistoryRef.current && !chatHistoryRef.current.contains(event.target as Node)) {
        setShowChatHistory(false);
      }
    };

    if (isExpanded || showUserMenu || showChatHistory) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded, showUserMenu, showChatHistory]);

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

  // Filter chats based on search
  const filteredChats = chatHistory.filter(chat => {
    const searchLower = chatSearchQuery.toLowerCase();
    const title = chat.title?.toLowerCase() || '';
    const preview = chat.preview?.toLowerCase() || '';
    return title.includes(searchLower) || preview.includes(searchLower);
  });


  return (
    <>
      {/* Taskbar */}
      <div
        ref={taskBarRef}
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
          isDarkMode ? 'bg-[#202123] border-gray-700' : 'bg-white border-gray-200'
        } border-r shadow-lg`}
        style={{
          width: isExpanded ? '280px' : '56px', // 56px ≈ 1.5cm
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full p-4 flex items-center justify-center transition-colors ${
            isDarkMode 
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
        >
          {isExpanded ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* New Chat Button - Always Circular */}
        <div className={`flex items-center mt-4 ${isExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
          <button
            onClick={() => window.location.reload()}
            className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: '#C7A562',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B59552'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7A562'}
            aria-label="New Chat"
          >
            <Plus size={18} strokeWidth={3} style={{ color: '#004A84' }} />
          </button>
          {isExpanded && (
            <span 
              className="ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-300"
              style={{ color: '#004A84' }}
            >
              New Chat
            </span>
          )}
        </div>

        {/* Chat History Button - Speech Bubble with Clock */}
        <div className={`flex items-center mt-4 ${isExpanded ? 'px-4 justify-start' : 'px-2 justify-center'}`}>
          <button
            onClick={() => setShowChatHistory(!showChatHistory)}
            className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:shadow-lg relative"
            style={{
              backgroundColor: '#C7A562',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B59552'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7A562'}
            aria-label="Chat History"
          >
            {/* Speech Bubble SVG with Clock Hands */}
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              {/* Speech Bubble */}
              <circle cx="20" cy="18" r="16" fill="#004A84" />
              <path d="M 12 30 L 8 38 L 20 32" fill="#004A84" />
              
              {/* Clock Hands */}
              {/* Center dot */}
              <circle cx="20" cy="18" r="1.5" fill="white" />
              {/* Hour hand (12 o'clock) */}
              <rect x="19" y="10" width="2" height="8" fill="white" rx="1" />
              {/* Minute hand (4 o'clock) */}
              <rect x="19" y="17" width="2" height="10" fill="white" rx="1" 
                    transform="rotate(120 20 18)" />
            </svg>
          </button>
          {isExpanded && (
            <span 
              className="ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-300"
              style={{ color: '#004A84' }}
            >
              Chat History
            </span>
          )}
        </div>


        {/* Bottom Section - User Button */}
        <div className="absolute bottom-4 left-0 right-0">
          <div className={`${isExpanded ? 'px-4' : 'px-2'}`}>
            <div className={`text-xs mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ${isExpanded ? 'block' : 'hidden'}`}>
              <div className="font-semibold">AI Legal Assistant</div>
              <div>Version 1.0.0</div>
            </div>
            
            {/* User/Auth Button */}
            <div className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: '#C7A562',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B59552'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7A562'}
                aria-label={session ? 'User menu' : 'Sign in'}
              >
                <span className="text-base font-bold" style={{ color: '#004A84', fontStyle: 'normal' }}>
                  {session ? getUserInitials() : '?'}
                </span>
              </button>
              {isExpanded && (
                <span 
                  className="ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-300"
                  style={{ color: '#004A84' }}
                >
                  {session ? (session.user?.name || session.user?.email || 'User') : 'Sign In'}
                </span>
              )}

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className={`absolute bottom-full mb-2 ${isExpanded ? 'right-0' : 'left-0'} w-48 rounded-lg shadow-lg z-50 ${
                  isDarkMode ? 'bg-[#202123] border-gray-700' : 'bg-white border-gray-200'
                } border`}>
                  {session ? (
                    <>
                      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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

      {/* Chat History Sidebar */}
      {showChatHistory && (
        <div
          ref={chatHistoryRef}
          className={`fixed top-0 h-full shadow-xl z-50 transition-all duration-300 ${
            isDarkMode ? 'bg-[#202123] border-gray-700' : 'bg-white border-gray-200'
          } border-r`}
          style={{
            left: isExpanded ? '280px' : '56px',
            width: '320px',
          }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Chat History
            </h3>
            <button
              onClick={() => setShowChatHistory(false)}
              className={`p-1 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ChevronRight size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>

          {/* Search Field - Only for signed-in users */}
          {session && (
            <div className="px-4 py-3">
              <div className="relative">
                <Search size={16} className={`absolute left-3 top-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {!session ? (
              // Message for non-signed-in users
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="text-sm">Sign in to keep your chat history</p>
                <button
                  onClick={() => {
                    setShowChatHistory(false);
                    signIn();
                  }}
                  className="mt-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: '#C7A562',
                    color: '#004A84',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B59552'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7A562'}
                >
                  Sign In
                </button>
              </div>
            ) : filteredChats.length === 0 ? (
              // No chats found
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="text-sm">
                  {chatSearchQuery ? 'No chats found' : 'No chat history yet'}
                </p>
              </div>
            ) : (
              // Chat list
              <div className="space-y-2">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      // Handle chat selection
                      window.location.href = `/?chat=${chat.id}`;
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-800 border-gray-700' 
                        : 'hover:bg-gray-50 border-gray-200'
                    } border`}
                  >
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {chat.title || 'Untitled Chat'}
                    </div>
                    {chat.preview && (
                      <div className={`text-xs mt-1 line-clamp-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {chat.preview}
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${
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
    </>
  );
}