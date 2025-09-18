'use client'

import React from 'react'
import { AlertTriangle, WifiOff, Bug } from 'lucide-react'
import Button from './button'
import Card from './card'
import { type ErrorMessageProps } from '../../lib/types/ui'

const errorIcons = {
  network: WifiOff,
  api: AlertTriangle,
  validation: AlertTriangle,
  generic: Bug,
}

const errorTitles = {
  network: 'Connection Problem',
  api: 'Service Error',
  validation: 'Invalid Input',
  generic: 'Something Went Wrong',
}

const errorDescriptions = {
  network: 'Unable to connect to the server. Please check your internet connection.',
  api: 'The service is temporarily unavailable. Please try again in a moment.',
  validation: 'Please check your input and try again.',
  generic: 'An unexpected error occurred. Our team has been notified.',
}

export function ErrorMessage({ 
  type, 
  message, 
  actions = [], 
  className = '',
  ...props 
}: ErrorMessageProps) {
  const Icon = errorIcons[type]
  const title = errorTitles[type]
  const description = message || errorDescriptions[type]

  return (
    <Card 
      variant="outlined" 
      padding="lg" 
      className={`text-center max-w-md mx-auto ${className}`}
      {...props}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 rounded-full bg-destructive/10">
          <Icon className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.action}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

// Specific error fallback components
export function NetworkErrorFallback({ 
  retry 
}: { 
  error: Error
  retry: () => void 
}) {
  return (
    <ErrorMessage
      type="network"
      message="Unable to connect to the chat service. Please check your internet connection and try again."
      actions={[
        {
          label: 'Try Again',
          action: retry,
          variant: 'primary'
        },
        {
          label: 'Go Offline',
          action: () => window.location.reload(),
          variant: 'secondary'
        }
      ]}
    />
  )
}

export function APIErrorFallback({ 
  error, 
  retry 
}: { 
  error: Error
  retry: () => void 
}) {
  const isRateLimit = error.message.includes('rate limit') || error.message.includes('429')
  const isServerError = error.message.includes('500') || error.message.includes('502') || error.message.includes('503')
  
  let message = 'The chat service is temporarily unavailable.'
  if (isRateLimit) {
    message = 'You\'ve reached the rate limit. Please wait a moment before trying again.'
  } else if (isServerError) {
    message = 'The server is experiencing issues. Please try again in a few minutes.'
  }

  return (
    <ErrorMessage
      type="api"
      message={message}
      actions={[
        {
          label: isRateLimit ? 'Wait and Retry' : 'Try Again',
          action: retry,
          variant: 'primary'
        },
        {
          label: 'Refresh Page',
          action: () => window.location.reload(),
          variant: 'secondary'
        }
      ]}
    />
  )
}

export function GenericErrorFallback({ 
  error, 
  retry 
}: { 
  error: Error
  retry: () => void 
}) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return (
    <ErrorMessage
      type="generic"
      message={
        isDevelopment 
          ? `Development Error: ${error.message}`
          : 'An unexpected error occurred. Please try refreshing the page.'
      }
      actions={[
        {
          label: 'Try Again',
          action: retry,
          variant: 'primary'
        },
        {
          label: 'Refresh Page',
          action: () => window.location.reload(),
          variant: 'secondary'
        }
      ]}
    />
  )
}