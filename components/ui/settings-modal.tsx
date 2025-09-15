import React, { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../hooks/use-theme'
// import Button from './button' // Unused import
import SettingsPanel from './settings-panel'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, className }) => {
  const { animationsEnabled } = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Delay hiding to allow exit animation
      const timeout = setTimeout(() => {
        setIsVisible(false)
      }, animationsEnabled ? 200 : 0)
      
      // Restore body scroll
      document.body.style.overflow = ''
      
      return () => clearTimeout(timeout)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, animationsEnabled])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Don't render if not visible
  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
          animationsEnabled && "duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full max-w-4xl max-h-[90vh] bg-background rounded-lg shadow-xl border border-border overflow-hidden",
          "transition-all",
          animationsEnabled && "duration-200",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-4"
        )}
      >
        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          <SettingsPanel onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

export default SettingsModal

// Hook for managing settings modal state
export function useSettingsModal() {
  const [isOpen, setIsOpen] = useState(false)

  const openSettings = () => setIsOpen(true)
  const closeSettings = () => setIsOpen(false)
  const toggleSettings = () => setIsOpen(prev => !prev)

  return {
    isOpen,
    openSettings,
    closeSettings,
    toggleSettings,
  }
}