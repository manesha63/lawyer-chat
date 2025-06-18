'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Plus, X, LogOut, User } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function TaskBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const taskBarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useSidebarStore();
  const router = useRouter();
  const { data: session, status } = useSession();

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
              width: '40px',
              height: '40px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B59552'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7A562'}
            aria-label="New Chat"
          >
            <Plus size={20} strokeWidth={3} style={{ color: '#004A84' }} />
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


        {/* Bottom Section - User Button */}
        <div className="absolute bottom-4 left-0 right-0">
          <div className={`flex items-center ${isExpanded ? 'px-4 justify-between' : 'px-2 justify-center'}`}>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ${isExpanded ? 'block' : 'hidden'}`}>
              <div className="font-semibold">AI Legal Assistant</div>
              <div>Version 1.0.0</div>
            </div>
            
            {/* User/Auth Button */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex-shrink-0 flex items-center justify-center transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: '#C7A562',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B59552'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7A562'}
                aria-label={session ? 'User menu' : 'Sign in'}
              >
                <span className="text-sm font-bold" style={{ color: '#004A84' }}>
                  {session ? getUserInitials() : '?'}
                </span>
              </button>

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