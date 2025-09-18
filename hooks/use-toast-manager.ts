'use client'

import React from 'react'
import { toastManager } from '../lib/utils/toast-manager'
import { type ToastProps } from '../components/ui/toast'

interface ToastData extends Omit<ToastProps, 'visible' | 'onClose'> {
  id: string
  timestamp: number
}

export function useToastManager() {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  React.useEffect(() => {
    return toastManager.subscribe(setToasts)
  }, [])

  return {
    toasts,
    add: toastManager.add.bind(toastManager),
    remove: toastManager.remove.bind(toastManager),
    clear: toastManager.clear.bind(toastManager),
    update: toastManager.update.bind(toastManager),
    success: toastManager.success.bind(toastManager),
    error: toastManager.error.bind(toastManager),
    warning: toastManager.warning.bind(toastManager),
    info: toastManager.info.bind(toastManager),
  }
}

// Hook for network-aware toasts
export function useNetworkToasts() {
  const { networkState } = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return { networkState: { isOnline: navigator.onLine } }
    }
    return { networkState: { isOnline: true } }
  }, [])

  const [wasOffline, setWasOffline] = React.useState(false)

  React.useEffect(() => {
    const handleOnline = () => {
      if (wasOffline) {
        toastManager.backOnlineNotification()
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      toastManager.offlineNotification()
      setWasOffline(true)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [wasOffline])

  return {
    networkError: toastManager.networkError.bind(toastManager),
    serverError: toastManager.serverError.bind(toastManager),
    rateLimitError: toastManager.rateLimitError.bind(toastManager),
    isOnline: networkState.isOnline,
  }
}

// Hook for error handling with toasts
export function useErrorToast() {
  const showError = React.useCallback((error: Error, context?: string) => {
    const title = context ? `${context} Error` : 'Error'
    const description = error.message || 'An unexpected error occurred'
    
    return toastManager.error(title, description, {
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    })
  }, [])

  const showNetworkError = React.useCallback((error?: Error) => {
    return toastManager.networkError(error)
  }, [])

  const showServerError = React.useCallback((error?: Error) => {
    return toastManager.serverError(error)
  }, [])

  return {
    showError,
    showNetworkError,
    showServerError,
  }
}