'use client'

import React from 'react'
import { Wifi, WifiOff, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { useNetworkState, networkManager } from '../../lib/utils/network'
import Button from './button'

interface ConnectionStatusProps {
  showDetails?: boolean
  className?: string
}

export function ConnectionStatus({ showDetails = false, className = '' }: ConnectionStatusProps) {
  const networkState = useNetworkState()
  const [queueSize, setQueueSize] = React.useState(0)
  const [showRetryPrompt, setShowRetryPrompt] = React.useState(false)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setQueueSize(networkManager.getQueueSize())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    if (!networkState.isOnline && queueSize > 0) {
      setShowRetryPrompt(true)
    } else if (networkState.isOnline) {
      setShowRetryPrompt(false)
    }
  }, [networkState.isOnline, queueSize])

  const handleRetryQueue = () => {
    // The network manager will automatically process the queue when online
    setShowRetryPrompt(false)
  }

  const handleClearQueue = () => {
    networkManager.clearQueue()
    setQueueSize(0)
    setShowRetryPrompt(false)
  }

  if (!showDetails && networkState.isOnline && queueSize === 0) {
    return null // Don't show anything when everything is fine
  }

  const getStatusIcon = () => {
    if (!networkState.isOnline) {
      return <WifiOff className="h-4 w-4 text-destructive" />
    }
    if (queueSize > 0) {
      return <Clock className="h-4 w-4 text-warning" />
    }
    return <Wifi className="h-4 w-4 text-success" />
  }

  const getStatusText = () => {
    if (!networkState.isOnline) {
      return 'Offline'
    }
    if (queueSize > 0) {
      return `${queueSize} queued`
    }
    return 'Connected'
  }

  const getStatusColor = () => {
    if (!networkState.isOnline) {
      return 'text-destructive'
    }
    if (queueSize > 0) {
      return 'text-warning'
    }
    return 'text-success'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {showDetails && (
        <div className="flex items-center space-x-2">
          {networkState.connectionType && (
            <span className="text-xs text-muted-foreground">
              {networkState.connectionType}
            </span>
          )}
          
          {showRetryPrompt && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetryQueue}
                className="h-6 px-2 text-xs"
              >
                Retry
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearQueue}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Toast-style connection status notification
export function ConnectionStatusToast() {
  const networkState = useNetworkState()
  const [show, setShow] = React.useState(false)
  const [lastOnlineState, setLastOnlineState] = React.useState(networkState.isOnline)

  React.useEffect(() => {
    if (networkState.isOnline !== lastOnlineState) {
      setShow(true)
      setLastOnlineState(networkState.isOnline)
      
      // Auto-hide after 3 seconds if back online
      if (networkState.isOnline) {
        const timer = setTimeout(() => setShow(false), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [networkState.isOnline, lastOnlineState])

  if (!show) return null

  return (
    <div className={`
      fixed top-4 right-4 z-50 flex items-center space-x-2 rounded-lg px-4 py-2 shadow-lg
      ${networkState.isOnline 
        ? 'bg-success text-success-foreground' 
        : 'bg-destructive text-destructive-foreground'
      }
    `}>
      {networkState.isOnline ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Connection lost</span>
        </>
      )}
      
      <button
        onClick={() => setShow(false)}
        className="ml-2 text-current hover:opacity-70"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Hook for connection-aware components
export function useConnectionStatus() {
  const networkState = useNetworkState()
  const [queueSize, setQueueSize] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setQueueSize(networkManager.getQueueSize())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    isOnline: networkState.isOnline,
    connectionType: networkState.connectionType,
    queueSize,
    hasQueuedRequests: queueSize > 0,
    retryQueue: () => {
      // Queue will be processed automatically when online
    },
    clearQueue: () => {
      networkManager.clearQueue()
    }
  }
}