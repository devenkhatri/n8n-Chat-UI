import React from 'react'
import { type BaseComponentProps } from '../../lib/types/ui'
import { cn } from '../../lib/utils'
import { useTheme } from '../../hooks/use-theme'
import Button from './button'

// Theme icons
const SunIcon = ({ className }: { className?: string }) => (
  <svg 
    className={cn("h-4 w-4", className)} 
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
    className={cn("h-4 w-4", className)} 
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

const MonitorIcon = ({ className }: { className?: string }) => (
  <svg 
    className={cn("h-4 w-4", className)} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
    />
  </svg>
)

interface ThemeToggleProps extends BaseComponentProps {
  variant?: 'toggle' | 'cycle' | 'dropdown'
  showLabel?: boolean
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  children, 
  variant = 'toggle',
  showLabel = false 
}) => {
  const { 
    theme, 
    toggleTheme, 
    cycleTheme, 
    getThemeIcon, 
    getThemeLabel, 
    mounted,
    animationsEnabled 
  } = useTheme()

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={className}>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          disabled
        >
          <SunIcon />
        </Button>
        {children}
      </div>
    )
  }

  const handleClick = variant === 'cycle' ? cycleTheme : toggleTheme
  
  const getIcon = () => {
    const iconType = getThemeIcon()
    switch (iconType) {
      case 'sun':
        return <SunIcon />
      case 'moon':
        return <MoonIcon />
      case 'monitor':
        return <MonitorIcon />
      default:
        return <SunIcon />
    }
  }

  const getAriaLabel = () => {
    if (variant === 'cycle') {
      return `Current theme: ${getThemeLabel()}. Click to cycle themes.`
    }
    return `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`
  }

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          "h-9 p-0 transition-all",
          showLabel ? "px-3 gap-2" : "w-9",
          animationsEnabled && "duration-200"
        )}
        aria-label={getAriaLabel()}
        title={getThemeLabel()}
      >
        <span className={cn(
          "transition-transform",
          animationsEnabled && "duration-200"
        )}>
          {getIcon()}
        </span>
        {showLabel && (
          <span className="text-sm font-medium">
            {getThemeLabel()}
          </span>
        )}
      </Button>
      {children}
    </div>
  )
}

export default ThemeToggle