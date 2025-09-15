// Mobile utility functions and hooks

import { useEffect, useState } from 'react'

// Detect if the user is on a mobile device
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// Detect if the user is on a touch device
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Hook to detect mobile device
export const useIsMobile = (): boolean => {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    setMobile(isMobile())
  }, [])

  return mobile
}

// Hook to detect touch device
export const useIsTouchDevice = (): boolean => {
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    setTouch(isTouchDevice())
  }, [])

  return touch
}

// Hook to detect viewport height changes (useful for mobile keyboard)
export const useViewportHeight = () => {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const updateHeight = () => {
      setHeight(window.innerHeight)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    window.addEventListener('orientationchange', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('orientationchange', updateHeight)
    }
  }, [])

  return height
}

// Hook to detect if mobile keyboard is open
export const useKeyboardOpen = () => {
  const [isOpen, setIsOpen] = useState(false)
  const viewportHeight = useViewportHeight()
  const [initialHeight, setInitialHeight] = useState(0)

  useEffect(() => {
    if (initialHeight === 0 && viewportHeight > 0) {
      setInitialHeight(viewportHeight)
    }
  }, [viewportHeight, initialHeight])

  useEffect(() => {
    if (initialHeight > 0) {
      // Consider keyboard open if viewport height is significantly smaller
      const threshold = initialHeight * 0.75
      setIsOpen(viewportHeight < threshold)
    }
  }, [viewportHeight, initialHeight])

  return isOpen
}

// Prevent zoom on input focus (iOS Safari)
export const preventZoomOnFocus = (element: HTMLInputElement | HTMLTextAreaElement) => {
  if (!isMobile()) return

  const originalFontSize = element.style.fontSize
  
  element.addEventListener('focus', () => {
    element.style.fontSize = '16px'
  })
  
  element.addEventListener('blur', () => {
    element.style.fontSize = originalFontSize
  })
}

// Add touch-friendly styles
export const touchFriendlyStyles = {
  minHeight: '44px', // Apple's recommended minimum touch target size
  minWidth: '44px',
  padding: '12px 16px',
}

// Haptic feedback (if supported)
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window === 'undefined') return
  
  // Check if the device supports haptic feedback
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    }
    navigator.vibrate(patterns[type])
  }
}

// Smooth scroll to element (mobile-optimized)
export const smoothScrollToElement = (
  element: HTMLElement, 
  options: ScrollIntoViewOptions = {}
) => {
  const defaultOptions: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest'
  }

  element.scrollIntoView({ ...defaultOptions, ...options })
}

// Handle safe area insets for devices with notches
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 }
  
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  }
}

// Mobile-specific event handlers
export const addTouchEventListeners = (
  element: HTMLElement,
  handlers: {
    onTouchStart?: (e: TouchEvent) => void
    onTouchMove?: (e: TouchEvent) => void
    onTouchEnd?: (e: TouchEvent) => void
    onTap?: (e: TouchEvent) => void
  }
) => {
  let startTime: number
  let startX: number
  let startY: number

  const handleTouchStart = (e: TouchEvent) => {
    startTime = Date.now()
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    handlers.onTouchStart?.(e)
  }

  const handleTouchMove = (e: TouchEvent) => {
    handlers.onTouchMove?.(e)
  }

  const handleTouchEnd = (e: TouchEvent) => {
    const endTime = Date.now()
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    
    const timeDiff = endTime - startTime
    const distanceX = Math.abs(endX - startX)
    const distanceY = Math.abs(endY - startY)
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    
    // Consider it a tap if it's quick and doesn't move much
    if (timeDiff < 300 && distance < 10) {
      handlers.onTap?.(e)
    }
    
    handlers.onTouchEnd?.(e)
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchmove', handleTouchMove, { passive: true })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
  }
}

// Optimize for mobile performance
export const optimizeForMobile = () => {
  if (typeof document === 'undefined') return

  // Add mobile-specific meta tags if not present
  const viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    document.head.appendChild(meta)
  }

  // Add touch-action CSS for better touch handling
  document.body.style.touchAction = 'manipulation'
  
  // Prevent pull-to-refresh on mobile
  document.body.style.overscrollBehavior = 'none'
}

// Mobile-specific CSS classes
export const mobileClasses = {
  touchTarget: 'min-h-[44px] min-w-[44px] p-3',
  mobileOnly: 'block sm:hidden',
  desktopOnly: 'hidden sm:block',
  mobileText: 'text-sm sm:text-base',
  mobilePadding: 'p-4 sm:p-6 lg:p-8',
  mobileSpacing: 'space-y-4 sm:space-y-6 lg:space-y-8',
  safeArea: 'pb-safe-bottom pl-safe-left pr-safe-right pt-safe-top'
}