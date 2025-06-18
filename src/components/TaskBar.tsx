'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Home, MessageSquare, Wrench, BookOpen, Settings, HelpCircle, X } from 'lucide-react';
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
    { icon: Home, label: 'Home', action: () => router.push('/') },
    { icon: MessageSquare, label: 'New Chat', action: () => window.location.reload() },
    { icon: Wrench, label: 'Legal Tools', action: () => {} },
    { icon: BookOpen, label: 'Documentation', action: () => {} },
    { icon: Settings, label: 'Settings', action: () => {} },
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

        {/* Menu Items */}
        <nav className="mt-4">
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