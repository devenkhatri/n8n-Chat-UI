import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { type ChatInputProps } from '../../lib/types/ui'
import { cn } from '../../lib/utils'
import { useIsMobile, useKeyboardOpen, preventZoomOnFocus, hapticFeedback } from '../../lib/utils/mobile'
import Button from './button'

// Send icon component
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
)

// Retry icon component
const RetryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
)

// Warning icon component
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="m12 17 .01 0"/>
  </svg>
)

// Clock icon component
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
)

// Character count component
const CharacterCount: React.FC<{ 
  current: number; 
  max?: number; 
  className?: string;
  id?: string;
  role?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-label'?: string;
}> = ({ current, max, className, id, role, 'aria-live': ariaLive, 'aria-label': ariaLabel, ...props }) => {
  if (!max) return null
  
  const percentage = (current / max) * 100
  const isNearLimit = percentage >= 80
  const isOverLimit = current > max
  
  return (
    <div 
      id={id}
      role={role}
      aria-live={ariaLive}
      aria-label={ariaLabel}
      className={cn(
        "text-xs transition-colors duration-200",
        isOverLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {current}{max && `/${max}`}
    </div>
  )
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false, 
  loading = false, 
  placeholder = "Type your message...", 
  maxLength = 4000, 
  remainingMessages,
  error,
  onRetry,
  rateLimited = false,
  rateLimitReset,
  validationRules,
  className,
  children 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState<string>('')
  
  // Mobile optimizations
  const isMobile = useIsMobile()
  const isKeyboardOpen = useKeyboardOpen()
  
  // Validation logic
  const validateInput = useCallback((inputValue: string): string | null => {
    if (!validationRules) return null
    
    const trimmedValue = inputValue.trim()
    
    // Required validation
    if (validationRules.required && !trimmedValue) {
      return "Message is required"
    }
    
    // Min length validation
    if (validationRules.minLength && trimmedValue.length < validationRules.minLength) {
      return `Message must be at least ${validationRules.minLength} characters`
    }
    
    // Max length validation
    if (validationRules.maxLength && trimmedValue.length > validationRules.maxLength) {
      return `Message must not exceed ${validationRules.maxLength} characters`
    }
    
    // Pattern validation
    if (validationRules.pattern && !validationRules.pattern.test(trimmedValue)) {
      return "Message contains invalid characters"
    }
    
    // Custom validation
    if (validationRules.customValidator) {
      const customError = validationRules.customValidator(trimmedValue)
      if (customError) return customError
    }
    
    return null
  }, [validationRules])
  
  // Rate limit countdown effect
  useEffect(() => {
    if (!rateLimited || !rateLimitReset) {
      setRateLimitCountdown(null)
      return
    }
    
    const updateCountdown = () => {
      const now = new Date()
      const resetTime = new Date(rateLimitReset)
      const diff = Math.max(0, Math.ceil((resetTime.getTime() - now.getTime()) / 1000))
      
      if (diff <= 0) {
        setRateLimitCountdown(null)
        return
      }
      
      setRateLimitCountdown(diff)
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [rateLimited, rateLimitReset])
  
  // Auto-resize functionality
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    
    // Calculate new height with min/max constraints
    const scrollHeight = textarea.scrollHeight
    const minHeight = 44 // Minimum height (roughly 1 line)
    const maxHeight = 200 // Maximum height (roughly 8 lines)
    
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
    textarea.style.height = `${newHeight}px`
  }, [])
  
  // Adjust height when value changes
  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])
  
  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic checks
    if (disabled || loading || rateLimited) {
      if (rateLimited) {
        setAnnouncement('Cannot send message: rate limited')
      } else if (loading) {
        setAnnouncement('Message is already being sent')
      } else if (disabled) {
        setAnnouncement('Chat is disabled')
      }
      return
    }
    
    const trimmedValue = value.trim()
    if (!trimmedValue) {
      const errorMsg = "Message cannot be empty"
      setValidationError(errorMsg)
      setAnnouncement(`Validation error: ${errorMsg}`)
      return
    }
    
    // Length validation
    if (maxLength && value.length > maxLength) {
      const errorMsg = `Message exceeds ${maxLength} character limit`
      setValidationError(errorMsg)
      setAnnouncement(`Validation error: ${errorMsg}`)
      return
    }
    
    // Custom validation
    const validationErr = validateInput(value)
    if (validationErr) {
      setValidationError(validationErr)
      setAnnouncement(`Validation error: ${validationErr}`)
      return
    }
    
    // Clear any existing validation errors
    setValidationError(null)
    
    // Announce successful submission
    setAnnouncement('Message sent')
    
    // Submit the message
    onSubmit(trimmedValue)
    
    // Haptic feedback on mobile
    if (isMobile) {
      hapticFeedback('light')
    }
  }, [value, disabled, loading, rateLimited, maxLength, validateInput, onSubmit])
  
  // Handle key down events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
      return
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
      e.preventDefault()
      onChange('')
      setValidationError(null)
      textareaRef.current?.blur()
      return
    }
    
    // Ctrl/Cmd + A to select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      // Let default behavior handle this
      return
    }
    
    // Ctrl/Cmd + Z for undo (let default behavior handle this)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      return
    }
    
    // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z for redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      return
    }
  }, [handleSubmit, onChange])
  
  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null)
      setAnnouncement('Validation error cleared')
    }
    
    // Validate on change if there are validation rules
    if (validationRules) {
      const error = validateInput(newValue)
      if (error !== validationError) {
        setValidationError(error)
        if (error) {
          setAnnouncement(`Validation error: ${error}`)
        }
      }
    }
    
    // Announce character count milestones
    if (maxLength) {
      const percentage = (newValue.length / maxLength) * 100
      if (percentage >= 90 && (validationError?.includes('character') || newValue.length % 10 === 0)) {
        setAnnouncement(`${newValue.length} of ${maxLength} characters used`)
      }
    }
  }, [onChange, validationError, validationRules, validateInput, maxLength])
  
  // Handle focus/blur with mobile optimizations
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    
    // Mobile optimizations
    if (isMobile && textareaRef.current) {
      // Prevent zoom on iOS
      preventZoomOnFocus(textareaRef.current)
      
      // Scroll to input on mobile when keyboard opens
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }, 300) // Delay to allow keyboard animation
    }
  }, [isMobile])
  
  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])
  
  // Determine current error state
  const currentError = error || validationError
  
  // Determine if submit should be disabled
  const isSubmitDisabled = useMemo(() => {
    return disabled || 
           loading || 
           rateLimited || 
           !value.trim() || 
           (maxLength && value.length > maxLength) ||
           Boolean(validationError)
  }, [disabled, loading, rateLimited, value, maxLength, validationError])
  
  // Determine if we're at message limit
  const isAtMessageLimit = remainingMessages !== undefined && remainingMessages <= 0
  
  // Enhanced placeholder text
  const getPlaceholder = () => {
    if (loading) return "Sending message..."
    if (rateLimited && rateLimitCountdown) return `Rate limited. Try again in ${rateLimitCountdown}s`
    if (rateLimited) return "Rate limited. Please wait before sending another message"
    if (isAtMessageLimit) return "Message limit reached"
    if (disabled) return "Chat is disabled"
    return placeholder
  }
  
  // Format countdown time
  const formatCountdown = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }
  
  return (
    <div className={cn("w-full", className)} role="region" aria-label="Message input area">
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
      
      <form onSubmit={handleSubmit} className="relative" role="form" aria-label="Send message form">
        <div className={cn(
          "relative flex items-end gap-2 rounded-lg border transition-all duration-200",
          "bg-background hover:bg-muted/30",
          // Mobile-optimized padding and spacing
          isMobile ? "p-3 gap-3" : "p-3 gap-2",
          // Keyboard-aware styling on mobile
          isMobile && isKeyboardOpen && "mb-2",
          currentError ? "border-destructive ring-2 ring-destructive/20" :
          isFocused ? "border-ring ring-2 ring-ring/20" : "border-input",
          (disabled || rateLimited) && "opacity-50 cursor-not-allowed bg-muted/50",
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20"
        )}>
          {/* Main textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={getPlaceholder()}
              disabled={disabled || isAtMessageLimit || rateLimited}
              maxLength={maxLength}
              aria-invalid={Boolean(currentError)}
              aria-describedby={cn(
                maxLength && "char-count",
                currentError && "error-message",
                remainingMessages !== undefined && "remaining-messages",
                "keyboard-shortcuts"
              ).trim() || undefined}
              aria-required={validationRules?.required}
              rows={1}
              className={cn(
                "w-full resize-none border-0 bg-transparent p-0",
                // Mobile-optimized text size
                isMobile ? "text-base" : "text-sm", // 16px on mobile to prevent zoom
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-0",
                "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
                disabled && "cursor-not-allowed",
                // Mobile-specific touch optimizations
                isMobile && "touch-manipulation"
              )}
              style={{ 
                minHeight: isMobile ? '24px' : '20px', // Larger on mobile
                lineHeight: isMobile ? '24px' : '20px',
                // Prevent zoom on iOS
                fontSize: isMobile ? '16px' : undefined
              }}
              aria-label={cn(
                "Message input",
                currentError && `, Error: ${currentError}`,
                rateLimited && ", Rate limited",
                loading && ", Sending message"
              )}
            />
            
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  <span>Sending...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Submit/Retry button */}
          {error && onRetry ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRetry}
              disabled={loading || rateLimited}
              icon={<RetryIcon />}
              className="flex-shrink-0 h-8 w-8 p-0"
              aria-label="Retry sending message"
            />
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitDisabled}
              loading={loading}
              icon={!loading ? <SendIcon /> : undefined}
              className="flex-shrink-0 h-8 w-8 p-0"
              aria-label="Send message"
            />
          )}
        </div>
        
        {/* Error message */}
        {currentError && (
          <div className="mt-2 px-1" id="error-message" role="alert" aria-live="assertive">
            <div className="flex items-start gap-2 text-xs text-destructive">
              <WarningIcon aria-hidden="true" />
              <span className="flex-1">{currentError}</span>
              {error && onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                  className="h-auto p-1 text-xs text-destructive hover:text-destructive/80"
                  aria-label={`Retry sending message. Error: ${currentError}`}
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Rate limit information */}
        {rateLimited && rateLimitCountdown && (
          <div className="mt-2 px-1" role="status" aria-live="polite">
            <div className="flex items-center gap-2 text-xs text-warning">
              <ClockIcon aria-hidden="true" />
              <span>Rate limited. Try again in {formatCountdown(rateLimitCountdown)}</span>
            </div>
          </div>
        )}
        
        {/* Footer with character count and remaining messages */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {remainingMessages !== undefined && (
              <span 
                id="remaining-messages"
                className={cn(
                  "transition-colors duration-200",
                  remainingMessages <= 5 ? "text-warning" : "text-muted-foreground",
                  remainingMessages === 0 && "text-destructive"
                )}
                role="status"
                aria-live="polite"
              >
                {remainingMessages} messages remaining
              </span>
            )}
            
            {/* Keyboard shortcut hint */}
            {!currentError && !rateLimited && (
              <span 
                id="keyboard-shortcuts" 
                className="hidden sm:inline"
                aria-label="Keyboard shortcuts: Press Enter to send message, Shift plus Enter for new line, Escape to clear input"
              >
                Press Enter to send, Shift+Enter for new line
              </span>
            )}
          </div>
          
          {/* Character count */}
          <CharacterCount 
            current={value.length} 
            max={maxLength}
            id="char-count"
            className="tabindex-0"
            role="status"
            aria-live="polite"
            aria-label={`${value.length}${maxLength ? ` of ${maxLength}` : ''} characters`}
          />
        </div>
        
        {/* Additional content */}
        {children}
      </form>
    </div>
  )
}

export default ChatInput