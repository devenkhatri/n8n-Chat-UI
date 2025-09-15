'use client'

import React from 'react'
import { Button } from './button'
import Layout from './layout'
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface MessageLimitBannerProps {
  remaining: number
  total: number
  variant?: 'info' | 'warning' | 'error'
  showUpgrade?: boolean
  showDismiss?: boolean
  onUpgrade?: () => void
  onReset?: () => void
  onDismiss?: () => void
  className?: string
}

export function MessageLimitBanner({
  remaining,
  total,
  variant = 'info',
  showUpgrade = true,
  showDismiss = false,
  onUpgrade,
  onReset,
  onDismiss,
  className
}: MessageLimitBannerProps) {
  const percentage = (remaining / total) * 100
  const isEmpty = remaining === 0
  const isLow = percentage <= 20

  // Auto-determine variant based on remaining messages
  const effectiveVariant = isEmpty ? 'error' : isLow ? 'warning' : variant

  const getVariantStyles = () => {
    switch (effectiveVariant) {
      case 'error':
        return {
          container: 'bg-destructive/10 border-destructive/20 text-destructive',
          icon: 'text-destructive',
          text: 'text-destructive'
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
          icon: 'text-yellow-600 dark:text-yellow-400',
          text: 'text-yellow-800 dark:text-yellow-200'
        }
      default:
        return {
          container: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-800 dark:text-blue-200'
        }
    }
  }

  const getIcon = () => {
    switch (effectiveVariant) {
      case 'error':
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      default:
        return <InformationCircleIcon className="h-5 w-5" />
    }
  }

  const getMessage = () => {
    if (isEmpty) {
      return {
        title: 'Message limit reached',
        description: 'You\'ve used all your messages for this session. Reset to continue or upgrade for unlimited messages.'
      }
    }
    
    if (isLow) {
      return {
        title: `Only ${remaining} message${remaining === 1 ? '' : 's'} remaining`,
        description: 'You\'re running low on messages. Consider upgrading for unlimited conversations.'
      }
    }
    
    return {
      title: `${remaining} of ${total} messages remaining`,
      description: 'You\'re doing great! Keep the conversation going.'
    }
  }

  const styles = getVariantStyles()
  const message = getMessage()

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <Layout.Flex align="start" className="gap-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${styles.text}`}>
            {message.title}
          </h3>
          <p className={`text-xs mt-1 opacity-90 ${styles.text}`}>
            {message.description}
          </p>
          
          {/* Progress bar for non-empty states */}
          {!isEmpty && (
            <div className="mt-3">
              <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    effectiveVariant === 'warning' 
                      ? 'bg-yellow-500' 
                      : effectiveVariant === 'error'
                      ? 'bg-destructive'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Actions */}
          {(showUpgrade || onReset) && (
            <Layout.Flex className="gap-2 mt-3">
              {showUpgrade && onUpgrade && (
                <Button
                  size="sm"
                  variant={effectiveVariant === 'error' ? 'default' : 'ghost'}
                  onClick={onUpgrade}
                  className="text-xs h-7"
                >
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  Upgrade
                </Button>
              )}
              
              {onReset && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onReset}
                  className="text-xs h-7"
                >
                  Reset Session
                </Button>
              )}
            </Layout.Flex>
          )}
        </div>
        
        {showDismiss && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className={`h-6 w-6 p-0 ${styles.icon} hover:bg-black/10 dark:hover:bg-white/10`}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        )}
      </Layout.Flex>
    </div>
  )
}

export default MessageLimitBanner