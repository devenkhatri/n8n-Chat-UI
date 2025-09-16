import React from 'react'
import Image from 'next/image'
import { type HeaderProps } from '../../lib/types/ui'
import { cn } from '../../lib/utils'
import { useIsMobile, hapticFeedback } from '../../lib/utils/mobile'
import { useBrandingClasses } from '../../hooks/use-branding'
import Button from './button'
import ThemeToggle from './theme-toggle'
import SettingsModal, { useSettingsModal } from './settings-modal'

// Icons as simple SVG components
const SettingsIcon = ({ className }: { className?: string }) => (
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
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
    />
  </svg>
)

const MessageCounterBadge: React.FC<{ 
  remaining: number
  total?: number
  className?: string 
}> = ({ remaining, total = 5, className }) => {
  const percentage = (remaining / total) * 100
  const isLow = remaining <= 1
  const isEmpty = remaining <= 0
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
      isEmpty 
        ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
        : isLow 
          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
          : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
      className
    )}>
      {/* Progress indicator */}
      <div className="relative h-2 w-8 bg-current/20 rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute left-0 top-0 h-full bg-current transition-all duration-300 ease-out rounded-full",
            percentage < 10 && "min-w-[2px]" // Ensure visibility even at very low percentages
          )}
          style={{ width: `${Math.max(percentage, 0)}%` }}
        />
      </div>
      
      {/* Counter text */}
      <span className="tabular-nums">
        {isEmpty 
          ? "No messages left"
          : remaining === 1 
            ? "1 message left"
            : `${remaining} messages left`
        }
      </span>
    </div>
  )
}

const BrandingLogo: React.FC<{ 
  showBranding?: boolean
  className?: string 
}> = ({ showBranding = true, className }) => {
  const { appName, hasLogo, logoUrl, primaryColor } = useBrandingClasses()
  
  if (!showBranding) return null
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Custom logo or default logo */}
      {hasLogo && logoUrl ? (
        <div className="relative h-8 w-8">
          <Image
            src={logoUrl}
            alt={`${appName} logo`}
            fill
            className="object-contain rounded-lg"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              // Fallback to default logo if custom logo fails to load
              const img = e.currentTarget;
              img.style.display = 'none';
              const fallback = img.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
            unoptimized={logoUrl.startsWith('http')}
          />
        </div>
      ) : null}
      
      {/* Default logo (shown if no custom logo or as fallback) */}
      <div 
        className={cn(
          "h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
          hasLogo && "hidden" // Hidden by default if custom logo exists
        )}
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
        }}
      >
        <span className="text-white font-bold text-sm">
          {appName.charAt(0).toUpperCase()}
        </span>
      </div>
      
      <span className="font-semibold text-foreground hidden sm:inline">
        {appName}
      </span>
    </div>
  )
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  actions, 
  showBranding = true, 
  remainingMessages, 
  onReset,
  className,
  children 
}) => {
  const isMobile = useIsMobile()
  const showResetButton = remainingMessages !== undefined && remainingMessages <= 0
  const { isOpen: isSettingsOpen, openSettings, closeSettings } = useSettingsModal()
  
  const handleResetClick = () => {
    if (isMobile) {
      hapticFeedback('medium')
    }
    onReset?.()
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-border/40",
      className
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section - Branding and Title */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <BrandingLogo showBranding={showBranding} />
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center section - Message Counter (on larger screens) */}
        {remainingMessages !== undefined && (
          <div className="hidden md:flex items-center justify-center flex-shrink-0 mx-4">
            <MessageCounterBadge remaining={remainingMessages} />
          </div>
        )}

        {/* Right section - Actions and Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Message counter for mobile */}
          {remainingMessages !== undefined && (
            <div className="md:hidden">
              <MessageCounterBadge 
                remaining={remainingMessages} 
                className="text-xs px-2 py-1"
              />
            </div>
          )}

          {/* Reset button */}
          {showResetButton && onReset && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetClick}
              className={cn(
                "hidden sm:flex",
                isMobile && "touch-target" // Ensure touch-friendly size
              )}
              aria-label="Reset message limit"
            >
              Reset Limit
            </Button>
          )}

          {/* Custom actions */}
          {actions}

          {/* Settings button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openSettings}
            className="h-9 w-9 p-0"
            aria-label="Open settings"
          >
            <SettingsIcon />
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile reset button */}
          {showResetButton && onReset && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetClick}
              className={cn(
                "sm:hidden text-xs px-3 py-2",
                "touch-target min-h-[44px]" // Mobile-friendly touch target
              )}
              aria-label="Reset message limit"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Mobile subtitle */}
      {subtitle && (
        <div className="sm:hidden border-t border-border/40 px-4 py-2">
          <p className="text-sm text-muted-foreground truncate">
            {subtitle}
          </p>
        </div>
      )}

      {/* Additional content */}
      {children}

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </header>
  )
}

export default Header