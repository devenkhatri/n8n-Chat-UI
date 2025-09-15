'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { type BaseComponentProps } from '../../lib/types/ui'

export interface ToastProps extends BaseComponentProps {
  id?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  description?: string
  visible?: boolean
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: 'bg-success/10 border-success/20 text-success-foreground',
  error: 'bg-destructive/10 border-destructive/20 text-destructive-foreground',
  warning: 'bg-warning/10 border-warning/20 text-warning-foreground',
  info: 'bg-info/10 border-info/20 text-info-foreground',
}

const iconStyles = {
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-info',
}

const Toast: React.FC<ToastProps> = ({ 
  id,
  type = 'info',
  title,
  description,
  visible = true,
  duration = 5000,
  persistent = false,
  action,
  onClose,
  className = '',
  children 
}) => {
  const [isVisible, setIsVisible] = React.useState(visible)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const Icon = toastIcons[type]

  React.useEffect(() => {
    setIsVisible(visible)
  }, [visible])

  React.useEffect(() => {
    if (isVisible && !persistent && duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose()
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isVisible, persistent, duration])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (!persistent && duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose()
      }, 1000) // Shorter timeout after mouse leave
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`
            relative flex items-start space-x-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm
            ${toastStyles[type]}
            ${className}
          `}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconStyles[type]}`} />
          </div>

          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold text-foreground mb-1">
                {title}
              </h4>
            )}
            
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            
            {children}

            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium text-primary hover:text-primary/80 underline"
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>

          {!persistent && duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast