'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, MessageSquare, Wrench, BookOpen, HelpCircle, X } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar';
import { useRouter } from 'next/navigation';

export default function TaskBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const taskBarRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useSidebarStore();
  const router = useRouter();

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (taskBarRef.current && !taskBarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  const menuItems = [
    { icon: Wrench, label: 'Legal Tools', action: () => {} },
    { icon: BookOpen, label: 'Documentation', action: () => {} },
    { icon: HelpCircle, label: 'Help', action: () => {} },
  ];

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

        {/* New Chat Button - Special Styling */}
        <div className={`px-2 mt-4 ${isExpanded ? 'px-4' : ''}`}>
          <button
            onClick={() => window.location.reload()}
            className={`flex items-center transition-all duration-300 hover:shadow-lg ${
              isExpanded ? 'w-full' : 'w-10 mx-auto'
            }`}
            style={{
              backgroundColor: '#C7A562',
              borderRadius: isExpanded ? '8px' : '50%',
              height: '40px',
              padding: isExpanded ? '0 16px' : '0',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B59552'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C7A562'}
            aria-label="New Chat"
          >
            <div className="flex items-center justify-center" style={{ minWidth: '40px', height: '40px' }}>
              <MessageSquare size={20} style={{ color: '#004A84' }} />
            </div>
            {isExpanded && (
              <span 
                className="ml-2 text-sm font-medium whitespace-nowrap"
                style={{ color: '#004A84' }}
              >
                New Chat
              </span>
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="mt-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`w-full flex items-center px-4 py-3 transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span 
                className={`ml-3 text-sm font-medium transition-all duration-300 ${
                  isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom Section - Version Info */}
        <div className={`absolute bottom-4 left-0 right-0 px-4 ${isExpanded ? 'block' : 'hidden'}`}>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className="font-semibold">AI Legal Assistant</div>
            <div>Version 1.0.0</div>
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