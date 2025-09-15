'use client'

import React from 'react'
import { Button } from './button'
import { Card } from './card'
import Layout from './layout'
import { 
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface MessageLimitIndicatorProps {
  remaining: number
  total: number
  showUpgrade?: boolean
  onUpgrade?: () => void
  onReset?: () => void
  className?: string
}

export function MessageLimitIndicator({
  remaining,
  total,
  showUpgrade = true,
  onUpgrade,
  onReset,
  className
}: MessageLimitIndicatorProps) {
  const percentage = (remaining / total) * 100
  const isLow = percentage <= 20
  const isVeryLow = percentage <= 10
  const isEmpty = remaining === 0

  const getStatusColor = () => {
    if (isEmpty) return 'text-destructive'
    if (isVeryLow) return 'text-orange-600 dark:text-orange-400'
    if (isLow) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-muted-foreground'
  }

  const getProgressColor = () => {
    if (isEmpty) return 'bg-destructive'
    if (isVeryLow) return 'bg-orange-500'
    if (isLow) return 'bg-yellow-500'
    return 'bg-primary'
  }

  const getIcon = () => {
    if (isEmpty) return <ExclamationTriangleIcon className="h-4 w-4" />
    if (isVeryLow) return <ExclamationTriangleIcon className="h-4 w-4" />
    return <InformationCircleIcon className="h-4 w-4" />
  }

  const getMessage = () => {
    if (isEmpty) return 'No messages remaining'
    if (isVeryLow) return `Only ${remaining} message${remaining === 1 ? '' : 's'} left`
    if (isLow) return `${remaining} message${remaining === 1 ? '' : 's'} remaining`
    return `${remaining} of ${total} messages remaining`
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress bar */}
      <div className="space-y-2">
        <Layout.Flex justify="between" align="center">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getMessage()}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </Layout.Flex>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>
      </div>

      {/* Status message and actions */}
      {(isLow || isEmpty) && (
        <Card className={`p-4 ${isEmpty ? 'border-destructive/20 bg-destructive/5' : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'}`}>
          <Layout.Flex align="start" className="gap-3">
            <div className={`flex-shrink-0 ${getStatusColor()}`}>
              {getIcon()}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className={`text-sm font-medium ${getStatusColor()}`}>
                  {isEmpty ? 'Message limit reached' : 'Running low on messages'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isEmpty 
                    ? 'You\'ve used all your messages for this session. Reset to continue or upgrade for unlimited messages.'
                    : `You're running low on messages. Consider upgrading for unlimited conversations.`
                  }
                </p>
              </div>
              
              <Layout.Flex className="gap-2">
                {showUpgrade && onUpgrade && (
                  <Button
                    size="sm"
                    onClick={onUpgrade}
                    className="flex-1 sm:flex-none"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                )}
                
                {onReset && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="flex-1 sm:flex-none"
                  >
                    Reset Session
                  </Button>
                )}
              </Layout.Flex>
            </div>
          </Layout.Flex>
        </Card>
      )}
    </div>
  )
}

export default MessageLimitIndicator