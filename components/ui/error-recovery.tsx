'use client'

import React from 'react'
import { RefreshCw, AlertTriangle, Bug, Download, Trash2 } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { getStoredErrors, clearStoredErrors } from '../../lib/utils/error-logging'

interface ErrorRecoveryProps {
  error?: Error
  onRetry?: () => void
  onReset?: () => void
  showAdvanced?: boolean
}

export function ErrorRecovery({ 
  error, 
  onRetry, 
  onReset,
  showAdvanced = false 
}: ErrorRecoveryProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const [storedErrors, setStoredErrors] = React.useState<any[]>([])

  React.useEffect(() => {
    if (showAdvanced) {
      setStoredErrors(getStoredErrors())
    }
  }, [showAdvanced])

  const handleExportErrors = () => {
    const errors = getStoredErrors()
    const dataStr = JSON.stringify(errors, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleClearErrors = () => {
    clearStoredErrors()
    setStoredErrors([])
  }

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="space-y-4">
      <Card variant="outlined" padding="lg" className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Application Error
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {error?.message || 'An unexpected error occurred. Try one of the recovery options below.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
            {onRetry && (
              <Button
                variant="primary"
                onClick={onRetry}
                icon={<RefreshCw className="h-4 w-4" />}
                className="flex-1"
              >
                Try Again
              </Button>
            )}
            
            <Button
              variant="secondary"
              onClick={handleReload}
              className="flex-1"
            >
              Reload Page
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoHome}
            >
              Go Home
            </Button>
            
            {onReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
              >
                Reset App
              </Button>
            )}
          </div>
        </div>
      </Card>

      {showAdvanced && (
        <Card variant="outlined" padding="md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                Advanced Recovery Options
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportErrors}
                icon={<Download className="h-4 w-4" />}
                disabled={storedErrors.length === 0}
              >
                Export Logs ({storedErrors.length})
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearErrors}
                icon={<Trash2 className="h-4 w-4" />}
                disabled={storedErrors.length === 0}
              >
                Clear Logs
              </Button>
            </div>

            {showDetails && error && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Error Details
                </h5>
                <div className="bg-muted rounded-md p-3 text-xs font-mono">
                  <div className="space-y-1">
                    <div><strong>Name:</strong> {error.name}</div>
                    <div><strong>Message:</strong> {error.message}</div>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 text-xs whitespace-pre-wrap break-all">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showDetails && storedErrors.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Errors ({storedErrors.length})
                </h5>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {storedErrors.slice(-5).map((errorEntry, index) => (
                    <div key={index} className="bg-muted rounded-md p-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{errorEntry.error?.name || 'Unknown Error'}</span>
                        <span className="text-muted-foreground">
                          {new Date(errorEntry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-1 truncate">
                        {errorEntry.error?.message || 'No message'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}