'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type Variants, easeOut } from 'framer-motion'
import Toast from './toast'
import { useToastManager } from '../../hooks/use-toast-manager'

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  className?: string
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const toastVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -50, 
    scale: 0.95,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: easeOut }
  },
  exit: { 
    opacity: 0, 
    y: -50, 
    scale: 0.95,
    transition: { duration: 0.2 }
  },
}

export function ToastContainer({ 
  position = 'top-right',
  className = ''
}: ToastContainerProps) {
  const { toasts, remove } = useToastManager()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || toasts.length === 0) {
    return null
  }

  const container = (
    <div 
      className={`fixed z-50 pointer-events-none ${positionClasses[position]} ${className}`}
      aria-live="polite"
      aria-label="Notifications"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className="pointer-events-auto"
            >
              <Toast
                {...toast}
                visible={true}
                onClose={() => remove(toast.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )

  return createPortal(container, document.body)
}

// Accessibility-enhanced toast container
export function AccessibleToastContainer(props: ToastContainerProps) {
  const { toasts } = useToastManager()
  const [announcements, setAnnouncements] = React.useState<string[]>([])

  // Track toast additions for screen reader announcements
  React.useEffect(() => {
    const latestToast = toasts[0]
    if (latestToast) {
      const announcement = `${latestToast.type} notification: ${latestToast.title}${
        latestToast.description ? `. ${latestToast.description}` : ''
      }`
      
      setAnnouncements(prev => [announcement, ...prev.slice(0, 2)]) // Keep last 3 announcements
    }
  }, [toasts])

  return (
    <>
      <ToastContainer {...props} />
      
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
    </>
  )
}