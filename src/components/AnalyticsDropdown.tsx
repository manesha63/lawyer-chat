'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronUp, Download } from 'lucide-react'

interface AnalyticsData {
  trends?: any[]
  statistics?: Record<string, any>
  charts?: any[]
  summary?: string
  [key: string]: any
}

interface AnalyticsDropdownProps {
  data: AnalyticsData
  messageWidth: number
  inputAreaHeight: number
}

export default function AnalyticsDropdown({ data, messageWidth, inputAreaHeight }: AnalyticsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleDownload = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `analytics_${new Date().toISOString()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const getDropdownPosition = () => {
    if (!buttonRef.current) return {}
    
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = Math.min(400, viewportHeight - inputAreaHeight - 100)
    
    return {
      bottom: inputAreaHeight + 20,
      left: buttonRect.left,
      width: messageWidth,
      maxHeight: dropdownHeight
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg transition-all duration-200 transform active:scale-95 dark:bg-[#25262b] dark:text-[#d1d1d1] dark:hover:bg-[#404147] dark:active:bg-[#505157] bg-[#E1C88E] text-[#004A84] hover:bg-[#C8A665] active:bg-[#B59552]"
        aria-label="Toggle analytics view"
        style={{
          fontSize: '1.092rem',
          fontWeight: '600',
          letterSpacing: '0.05em'
        }}
      >
        ANALYTICS
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed z-50 bg-white dark:bg-[#25262b] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
          style={getDropdownPosition()}
        >
          <div className="sticky top-0 bg-gray-50 dark:bg-[#1a1b1e] px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Analytics Results</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Download analytics data"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Close analytics view"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(100% - 60px)' }}>
            {data.summary && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{data.summary}</p>
              </div>
            )}
            
            {data.statistics && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Statistics</h4>
                <div className="bg-gray-50 dark:bg-[#2e2f38] rounded p-3">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                    {JSON.stringify(data.statistics, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {data.trends && data.trends.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Trends</h4>
                <ul className="space-y-2">
                  {data.trends.map((trend, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="text-[#004A84] dark:text-[#C7A562] mr-2">•</span>
                      {JSON.stringify(trend)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.charts && data.charts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Charts Data</h4>
                <div className="bg-gray-50 dark:bg-[#2e2f38] rounded p-3">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                    {JSON.stringify(data.charts, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}