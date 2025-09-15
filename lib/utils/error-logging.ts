interface ErrorLogEntry {
  timestamp: Date
  error: Error
  errorInfo?: React.ErrorInfo
  userAgent: string
  url: string
  userId?: string
  sessionId?: string
  context?: Record<string, any>
}

interface ErrorReportingConfig {
  enabled: boolean
  endpoint?: string
  apiKey?: string
  maxRetries: number
  batchSize: number
  flushInterval: number
}

class ErrorLogger {
  private config: ErrorReportingConfig
  private errorQueue: ErrorLogEntry[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      maxRetries: 3,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...config
    }

    if (this.config.enabled && typeof window !== 'undefined') {
      this.startFlushTimer()
      this.setupGlobalErrorHandlers()
    }
  }

  logError(error: Error, errorInfo?: React.ErrorInfo, context?: Record<string, any>) {
    const entry: ErrorLogEntry = {
      timestamp: new Date(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error,
      errorInfo,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      sessionId: this.getSessionId(),
      context
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Logged')
      console.error('Error:', error)
      if (errorInfo) {
        console.error('Error Info:', errorInfo)
      }
      if (context) {
        console.error('Context:', context)
      }
      console.groupEnd()
    }

    // Store locally for potential retry
    this.storeErrorLocally(entry)

    if (this.config.enabled) {
      this.errorQueue.push(entry)
      
      if (this.errorQueue.length >= this.config.batchSize) {
        this.flushErrors()
      }
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        undefined,
        { type: 'unhandledrejection', reason: event.reason }
      )
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(
        new Error(event.message),
        undefined,
        { 
          type: 'javascript',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      )
    })
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.flushErrors()
      }
    }, this.config.flushInterval)
  }

  private async flushErrors() {
    if (!this.config.endpoint || this.errorQueue.length === 0) {
      return
    }

    const errors = this.errorQueue.splice(0, this.config.batchSize)
    
    try {
      await this.sendErrors(errors)
    } catch (error) {
      // Re-queue errors for retry
      this.errorQueue.unshift(...errors)
      console.warn('Failed to send error reports:', error)
    }
  }

  private async sendErrors(errors: ErrorLogEntry[], retryCount = 0): Promise<void> {
    if (!this.config.endpoint) {
      return
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({ errors })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000
        setTimeout(() => {
          this.sendErrors(errors, retryCount + 1)
        }, delay)
      } else {
        throw error
      }
    }
  }

  private storeErrorLocally(entry: ErrorLogEntry) {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('error_logs') || '[]'
      const logs = JSON.parse(stored)
      logs.push(entry)
      
      // Keep only last 50 errors
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50)
      }
      
      localStorage.setItem('error_logs', JSON.stringify(logs))
    } catch (error) {
      console.warn('Failed to store error locally:', error)
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'unknown'
    
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  getStoredErrors(): ErrorLogEntry[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem('error_logs') || '[]'
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  clearStoredErrors() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('error_logs')
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger({
  endpoint: process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT,
  apiKey: process.env.NEXT_PUBLIC_ERROR_REPORTING_API_KEY,
})

// Utility functions
export function logError(error: Error, context?: Record<string, any>) {
  errorLogger.logError(error, undefined, context)
}

export function logErrorWithInfo(error: Error, errorInfo: React.ErrorInfo, context?: Record<string, any>) {
  errorLogger.logError(error, errorInfo, context)
}

export function getStoredErrors() {
  return errorLogger.getStoredErrors()
}

export function clearStoredErrors() {
  errorLogger.clearStoredErrors()
}