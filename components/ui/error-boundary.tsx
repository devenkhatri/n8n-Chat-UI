import React from 'react'
import { type ErrorBoundaryProps } from '../../lib/types/ui'
import { logErrorWithInfo } from '../../lib/utils/error-logging'
import { GenericErrorFallback } from './error-message'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with context
    const context = {
      errorId: this.state.errorId,
      retryCount: this.retryCount,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      props: this.props.children ? 'has children' : 'no children'
    }

    logErrorWithInfo(error, errorInfo, context)
    
    // Store error info in state for potential debugging
    this.setState({ errorInfo })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.retryCount++
    
    // Log retry attempt
    if (this.state.error) {
      logErrorWithInfo(
        new Error(`Error boundary retry attempt ${this.retryCount}`),
        this.state.errorInfo!,
        {
          originalErrorId: this.state.errorId,
          retryCount: this.retryCount
        }
      )
    }

    // Reset error state
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent 
            error={this.state.error} 
            retry={this.handleRetry}
          />
        )
      }

      // Show different UI based on retry count
      if (this.retryCount >= this.maxRetries) {
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="p-3 rounded-full bg-destructive/10 mb-4">
              <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Persistent Error
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              This component has failed multiple times. Please refresh the page or contact support.
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => console.error('Error Details:', { 
                    error: this.state.error, 
                    errorInfo: this.state.errorInfo,
                    errorId: this.state.errorId
                  })}
                >
                  Debug Info
                </button>
              )}
            </div>
          </div>
        )
      }

      // Use generic error fallback
      return (
        <GenericErrorFallback 
          error={this.state.error} 
          retry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary