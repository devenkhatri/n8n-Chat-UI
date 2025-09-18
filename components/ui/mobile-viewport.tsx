import React, { useEffect } from 'react'
import { useKeyboardOpen, optimizeForMobile } from '../../lib/utils/mobile'
import { cn } from '../../lib/utils'

interface MobileViewportProps {
  children: React.ReactNode
  className?: string
}

// Component to handle mobile viewport optimizations
const MobileViewport: React.FC<MobileViewportProps> = ({ 
  children, 
  className 
}) => {
  const isKeyboardOpen = useKeyboardOpen()

  useEffect(() => {
    // Apply mobile optimizations on mount
    optimizeForMobile()
  }, [])

  useEffect(() => {
    // Handle keyboard open/close
    if (isKeyboardOpen) {
      document.body.classList.add('keyboard-open')
    } else {
      document.body.classList.remove('keyboard-open')
    }

    return () => {
      document.body.classList.remove('keyboard-open')
    }
  }, [isKeyboardOpen])

  return (
    <div className={cn(
      'min-h-screen min-h-[100dvh]', // Use dynamic viewport height
      isKeyboardOpen && 'keyboard-open',
      className
    )}>
      {children}
    </div>
  )
}

export default MobileViewport