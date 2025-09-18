import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'
import SettingsPanel from './settings-panel'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, className }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle modal visibility
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Don't render if not mounted or not open
  if (!mounted || !isOpen) return null

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div
        className={cn(
          "fixed inset-0 z-[10000] flex items-start justify-center p-4 pointer-events-none overflow-y-auto",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Modal Content */}
        <div className="relative w-full max-w-4xl min-h-0 my-8 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 pointer-events-auto">
          <div className="p-6 bg-white dark:bg-gray-900">
            <SettingsPanel onClose={onClose} />
          </div>
        </div>
      </div>
    </>
  )

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body)
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