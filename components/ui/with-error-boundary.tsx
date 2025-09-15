'use client'

import React from 'react'
import ErrorBoundary from './error-boundary'
import { NetworkErrorFallback, APIErrorFallback, GenericErrorFallback } from './error-message'

interface WithErrorBoundaryOptions {
  fallback?: 'network' | 'api' | 'generic' | React.ComponentType<{error: Error; retry: () => void}>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  isolate?: boolean // Whether to isolate this component's errors
}

const fallbackComponents = {
  network: NetworkErrorFallback,
  api: APIErrorFallback,
  generic: GenericErrorFallback,
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const { fallback = 'generic', onError, isolate = true } = options
    
    const FallbackComponent = typeof fallback === 'string' 
      ? fallbackComponents[fallback] 
      : fallback

    if (!isolate) {
      // Don't wrap with error boundary, let parent handle errors
      return <Component {...props} ref={ref} />
    }

    return (
      <ErrorBoundary
        fallback={FallbackComponent}
        onError={onError}
      >
        <Component {...props} ref={ref} />
      </ErrorBoundary>
    )
  })

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for manual error reporting
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const reportError = React.useCallback((error: Error, context?: Record<string, any>) => {
    // Log the error
    import('../../lib/utils/error-logging').then(({ logError }) => {
      logError(error, context)
    })
    
    // Set error state to trigger error boundary
    setError(error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  // Throw error to trigger error boundary
  if (error) {
    throw error
  }

  return { reportError, clearError }
}

// Component for manual error boundaries in JSX
export function ErrorBoundaryWrapper({ 
  children, 
  fallback,
  onError 
}: {
  children: React.ReactNode
  fallback?: WithErrorBoundaryOptions['fallback']
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}) {
  const FallbackComponent = typeof fallback === 'string' 
    ? fallbackComponents[fallback || 'generic']
    : fallback || GenericErrorFallback

  return (
    <ErrorBoundary
      fallback={FallbackComponent}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  )
}