'use client'

import React from 'react'
import { useNetworkRequest, isRetryableError, getErrorType } from '../lib/utils/network'
import { logError } from '../lib/utils/error-logging'

interface ChatRequestOptions {
  message: string
  sessionId?: string
  retryConfig?: {
    maxRetries?: number
    baseDelay?: number
  }
}

interface ChatResponse {
  message: string
  sessionId?: string
  remainingMessages?: number
  error?: string
}

export function useNetworkChat() {
  const { request, loading, error, networkState, queueSize } = useNetworkRequest()
  const [retryCount, setRetryCount] = React.useState(0)
  const [lastError, setLastError] = React.useState<Error | null>(null)

  const sendMessage = React.useCallback(async (options: ChatRequestOptions): Promise<ChatResponse> => {
    const { message, sessionId, retryConfig } = options
    
    try {
      setRetryCount(0)
      setLastError(null)

      const response = await request('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
        }),
      }, {
        maxRetries: retryConfig?.maxRetries || 3,
        baseDelay: retryConfig?.baseDelay || 1000,
        retryCondition: (error) => {
          setRetryCount(prev => prev + 1)
          return isRetryableError(error)
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      const error = err as Error
      setLastError(error)
      
      // Log error with context
      logError(error, {
        action: 'sendMessage',
        message: message.substring(0, 100), // First 100 chars for context
        sessionId,
        retryCount,
        errorType: getErrorType(error),
        networkState: networkState.isOnline ? 'online' : 'offline'
      })
      
      throw error
    }
  }, [request, networkState, retryCount])

  return {
    sendMessage,
    loading,
    error: error || lastError,
    retryCount,
    isOnline: networkState.isOnline,
    queueSize,
    networkState
  }
}