'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import Toast, { type ToastProps } from '../components/ui/toast'

interface ToastData extends Omit<ToastProps, 'visible' | 'onClose'> {
  id: string
}

interface ToastContextValue {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
}

export function ToastProvider({ 
  children, 
  maxToasts = 5,
  position = 'top-right'
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastData = { ...toast, id }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      // Remove oldest toasts if we exceed maxToasts
      return updated.slice(0, maxToasts)
    })

    return id
  }, [maxToasts])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  }

  const toastContainer = mounted ? (
    createPortal(
      <div 
        className={`fixed z-50 flex flex-col space-y-2 pointer-events-none ${positionClasses[position]}`}
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              {...toast}
              visible={true}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>,
      document.body
    )
  ) : null

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toastContainer}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience hooks for different toast types
export function useToastActions() {
  const { addToast, removeToast, clearToasts } = useToast()

  const success = React.useCallback((title: string, description?: string, options?: Partial<ToastData>) => {
    return addToast({
      type: 'success',
      title,
      description,
      ...options,
    })
  }, [addToast])

  const error = React.useCallback((title: string, description?: string, options?: Partial<ToastData>) => {
    return addToast({
      type: 'error',
      title,
      description,
      persistent: true, // Errors should be persistent by default
      ...options,
    })
  }, [addToast])

  const warning = React.useCallback((title: string, description?: string, options?: Partial<ToastData>) => {
    return addToast({
      type: 'warning',
      title,
      description,
      ...options,
    })
  }, [addToast])

  const info = React.useCallback((title: string, description?: string, options?: Partial<ToastData>) => {
    return addToast({
      type: 'info',
      title,
      description,
      ...options,
    })
  }, [addToast])

  return {
    success,
    error,
    warning,
    info,
    remove: removeToast,
    clear: clearToasts,
  }
}