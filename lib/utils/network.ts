interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  retryCondition?: (error: unknown) => boolean
}

interface NetworkState {
  isOnline: boolean
  connectionType?: string
  effectiveType?: string
}

interface QueuedRequest {
  id: string
  url: string
  options: RequestInit
  resolve: (value: Response) => void
  reject: (error: Error) => void
  timestamp: number
  retryCount: number
}

class NetworkManager {
  private isOnline: boolean = true
  private connectionType: string = 'unknown'
  private requestQueue: QueuedRequest[] = []
  private retryTimers: Map<string, NodeJS.Timeout> = new Map()
  private listeners: Set<(state: NetworkState) => void> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupNetworkListeners()
      this.isOnline = navigator.onLine
      this.getConnectionInfo()
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as Navigator & { connection?: { addEventListener: (event: string, handler: () => void) => void } }).connection
      connection?.addEventListener('change', this.handleConnectionChange)
    }
  }

  private handleOnline = () => {
    this.isOnline = true
    this.notifyListeners()
    this.processQueue()
  }

  private handleOffline = () => {
    this.isOnline = false
    this.notifyListeners()
  }

  private handleConnectionChange = () => {
    this.getConnectionInfo()
    this.notifyListeners()
  }

  private getConnectionInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as Navigator & { connection?: { type?: string } }).connection
      this.connectionType = connection?.type || 'unknown'
    }
  }

  private notifyListeners() {
    const state: NetworkState = {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
    }
    this.listeners.forEach(listener => listener(state))
  }

  public subscribe(listener: (state: NetworkState) => void) {
    this.listeners.add(listener)
    
    // Immediately call with current state
    listener({
      isOnline: this.isOnline,
      connectionType: this.connectionType,
    })

    return () => {
      this.listeners.delete(listener)
    }
  }

  public getNetworkState(): NetworkState {
    return {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
    }
  }

  private async processQueue() {
    if (!this.isOnline || this.requestQueue.length === 0) {
      return
    }

    const requests = [...this.requestQueue]
    this.requestQueue = []

    for (const request of requests) {
      try {
        const response = await fetch(request.url, request.options)
        request.resolve(response)
      } catch (error) {
        request.reject(error as Error)
      }
    }
  }

  private queueRequest(url: string, options: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0
      }

      this.requestQueue.push(request)

      // Auto-reject after 5 minutes
      setTimeout(() => {
        const index = this.requestQueue.findIndex(r => r.id === request.id)
        if (index !== -1) {
          this.requestQueue.splice(index, 1)
          reject(new Error('Request timeout: queued too long'))
        }
      }, 5 * 60 * 1000)
    })
  }

  public async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<Response> {
    const config: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      retryCondition: (error: unknown) => {
        // Retry on network errors, 5xx errors, and 429 (rate limit)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          return true; // Network error
        }
        
        // Use type assertion with the ErrorWithStatus interface
        const errorWithStatus = error as ErrorWithStatus;
        const status = errorWithStatus.status;
        
        if (typeof status === 'number' && (status >= 500 || status === 429)) {
          return true; // Server error or rate limit
        }
        
        return false;
      },
      ...retryConfig
    }

    let lastError: Error

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // If offline, queue the request
        if (!this.isOnline) {
          return await this.queueRequest(url, options)
        }

        const response = await fetch(url, options)

        // Check if response indicates an error that should be retried
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
          ;(error as Error & { status?: number; response?: Response }).status = response.status
          ;(error as Error & { status?: number; response?: Response }).response = response

          if (attempt < config.maxRetries && config.retryCondition!(error)) {
            lastError = error
            await this.delay(this.calculateDelay(attempt, config))
            continue
          }

          throw error
        }

        return response
      } catch (error) {
        lastError = error as Error

        if (attempt < config.maxRetries && config.retryCondition!(error)) {
          await this.delay(this.calculateDelay(attempt, config))
          continue
        }

        throw error
      }
    }

    throw lastError!
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt)
    const jitter = Math.random() * 0.1 * delay // Add 10% jitter
    return Math.min(delay + jitter, config.maxDelay)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  public clearQueue() {
    this.requestQueue = []
    this.retryTimers.forEach(timer => clearTimeout(timer))
    this.retryTimers.clear()
  }

  public getQueueSize(): number {
    return this.requestQueue.length
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
      
      if ('connection' in navigator) {
        const connection = (navigator as Navigator & { connection?: { removeEventListener: (event: string, handler: () => void) => void } }).connection
        connection?.removeEventListener('change', this.handleConnectionChange)
      }
    }
    
    this.clearQueue()
    this.listeners.clear()
  }
}

// Create singleton instance
export const networkManager = new NetworkManager()

// Utility functions
export async function fetchWithRetry(
  url: string, 
  options?: RequestInit, 
  retryConfig?: Partial<RetryConfig>
): Promise<Response> {
  return networkManager.fetchWithRetry(url, options, retryConfig)
}

export function useNetworkState() {
  const [networkState, setNetworkState] = React.useState<NetworkState>(() => 
    networkManager.getNetworkState()
  )

  React.useEffect(() => {
    return networkManager.subscribe(setNetworkState)
  }, [])

  return networkState
}

// React hook for network-aware requests
export function useNetworkRequest() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const networkState = useNetworkState()

  const request = React.useCallback(async (
    url: string,
    options?: RequestInit,
    retryConfig?: Partial<RetryConfig>
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRetry(url, options, retryConfig)
      return response
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    request,
    loading,
    error,
    networkState,
    isOnline: networkState.isOnline,
    queueSize: networkManager.getQueueSize()
  }
}

// Error classification utilities
interface ErrorWithStatus extends Error {
  status?: number;
  response?: Response;
}

export function isNetworkError(error: unknown): error is ErrorWithStatus {
  return error instanceof Error && 
    (error.name === 'TypeError' && error.message.includes('fetch') ||
    error.name === 'NetworkError');
}

export function isRetryableError(error: unknown): boolean {
  if (!isNetworkError(error)) return false;
  
  const status = error.status;
  return status === undefined || status >= 500 || status === 429;
}

export function getErrorType(error: unknown): 'network' | 'server' | 'client' | 'unknown' {
  if (isNetworkError(error)) {
    if (error.status === undefined) return 'network';
    
    if (error.status >= 500) return 'server';
    if (error.status >= 400) return 'client';
  }
  
  return 'unknown';
}

// Import React for hooks
import React from 'react'