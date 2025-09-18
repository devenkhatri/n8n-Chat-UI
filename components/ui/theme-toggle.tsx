import React, { useEffect, useState } from 'react'
import { type BaseComponentProps } from '../../lib/types/ui'
import { cn } from '../../lib/utils'
import { useTheme } from '../../hooks/use-theme'
import Button from './button'

// Theme icons
const SunIcon = ({ className }: { className?: string }) => (
  <svg 
    className={cn("h-5 w-5", className)} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
    />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg 
    className={cn("h-5 w-5", className)} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
    />
  </svg>
)

interface ThemeToggleProps extends BaseComponentProps {
  showLabel?: boolean
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  children, 
  showLabel = false 
}) => {
  const { theme, resolvedTheme, toggleTheme, mounted } = useTheme()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted || !isClient) {
    return (
      <div className={className}>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 rounded-xl"
          disabled
        >
          <div className="h-5 w-5">
            <SunIcon />
          </div>
        </Button>
        {children}
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'
  const isSystem = theme === 'system'
  
  const getIcon = () => {
    if (isSystem) {
      // Show system preference icon
      return isDark ? <MoonIcon /> : <SunIcon />
    }
    return isDark ? <MoonIcon /> : <SunIcon />
  }

  const getLabel = () => {
    if (isSystem) {
      return `System (${isDark ? 'Dark' : 'Light'})`
    }
    return isDark ? 'Dark' : 'Light'
  }

  const getAriaLabel = () => {
    return `Switch theme. Current: ${getLabel()}`
  }

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={cn(
          "h-10 p-0 transition-all rounded-xl",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
          showLabel ? "px-4 gap-2" : "w-10"
        )}
        aria-label={getAriaLabel()}
        title={getLabel()}
      >
        <div className={cn(
          "h-5 w-5 transition-all",
          "text-gray-600 dark:text-gray-400",
          "hover:text-gray-900 dark:hover:text-gray-100"
        )}>
          {getIcon()}
        </div>
        {showLabel && (
          <span className="text-sm font-semibold">
            {getLabel()}
          </span>
        )}
      </Button>
      {children}
    </div>
  )
}

export default ThemeToggle