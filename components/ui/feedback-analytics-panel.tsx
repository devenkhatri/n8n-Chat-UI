'use client'

import React from 'react'
import { Card } from './card'
import Layout from './layout'
import { 
  ChartBarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftEllipsisIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline'

export interface FeedbackStats {
  totalFeedback: number
  positiveCount: number
  negativeCount: number
  positivePercentage: number
  negativePercentage: number
  commentsCount: number
  averageRating: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface FeedbackEntry {
  id: string
  messageId: string
  rating: 'positive' | 'negative'
  comment?: string
  timestamp: Date
  messagePreview: string
}

interface FeedbackAnalyticsPanelProps {
  stats: FeedbackStats
  recentFeedback: FeedbackEntry[]
  timeRange?: '7d' | '30d' | '90d' | 'all'
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | 'all') => void
  className?: string
}

export function FeedbackAnalyticsPanel({
  stats,
  recentFeedback,
  timeRange = '30d',
  onTimeRangeChange,
  className
}: FeedbackAnalyticsPanelProps) {
  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ]

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return <TrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'down':
        return <TrendingDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Layout.Flex justify="between" align="center">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Feedback Analytics
          </h2>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange?.(e.target.value as any)}
          className="text-sm border border-border rounded-md px-3 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {timeRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Layout.Flex>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <Layout.Flex align="center" className="gap-2">
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Feedback</span>
            </Layout.Flex>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalFeedback.toLocaleString()}
            </div>
            <Layout.Flex align="center" className="gap-1">
              {getTrendIcon()}
              <span className={`text-xs ${getTrendColor()}`}>
                {stats.trendPercentage > 0 ? '+' : ''}{stats.trendPercentage}%
              </span>
            </Layout.Flex>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <Layout.Flex align="center" className="gap-2">
              <HandThumbUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-muted-foreground">Positive</span>
            </Layout.Flex>
            <div className="text-2xl font-bold text-foreground">
              {stats.positiveCount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.positivePercentage.toFixed(1)}% of total
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <Layout.Flex align="center" className="gap-2">
              <HandThumbDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-muted-foreground">Negative</span>
            </Layout.Flex>
            <div className="text-2xl font-bold text-foreground">
              {stats.negativeCount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.negativePercentage.toFixed(1)}% of total
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <Layout.Flex align="center" className="gap-2">
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg. Rating</span>
            </Layout.Flex>
            <div className="text-2xl font-bold text-foreground">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              Out of 5.0
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Rating Distribution */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Rating Distribution
        </h3>
        
        <div className="space-y-4">
          {/* Positive bar */}
          <div className="space-y-2">
            <Layout.Flex justify="between" align="center">
              <Layout.Flex align="center" className="gap-2">
                <HandThumbUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-foreground">Positive</span>
              </Layout.Flex>
              <span className="text-sm text-muted-foreground">
                {stats.positiveCount} ({stats.positivePercentage.toFixed(1)}%)
              </span>
            </Layout.Flex>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${stats.positivePercentage}%` }}
              />
            </div>
          </div>

          {/* Negative bar */}
          <div className="space-y-2">
            <Layout.Flex justify="between" align="center">
              <Layout.Flex align="center" className="gap-2">
                <HandThumbDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-foreground">Negative</span>
              </Layout.Flex>
              <span className="text-sm text-muted-foreground">
                {stats.negativeCount} ({stats.negativePercentage.toFixed(1)}%)
              </span>
            </Layout.Flex>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 bg-red-500 rounded-full transition-all duration-300"
                style={{ width: `${stats.negativePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Feedback */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Recent Feedback
        </h3>
        
        {recentFeedback.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No feedback received yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="border-l-4 pl-4 py-2 border-l-muted"
                style={{
                  borderLeftColor: feedback.rating === 'positive' 
                    ? 'rgb(34 197 94)' 
                    : 'rgb(239 68 68)'
                }}
              >
                <Layout.Flex justify="between" align="start" className="gap-4">
                  <div className="flex-1 space-y-1">
                    <Layout.Flex align="center" className="gap-2">
                      {feedback.rating === 'positive' ? (
                        <HandThumbUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <HandThumbDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      <span className="text-sm font-medium text-foreground capitalize">
                        {feedback.rating} feedback
                      </span>
                    </Layout.Flex>
                    
                    <p className="text-xs text-muted-foreground">
                      Message: "{feedback.messagePreview}"
                    </p>
                    
                    {feedback.comment && (
                      <p className="text-sm text-foreground">
                        "{feedback.comment}"
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <Layout.Flex align="center" className="gap-1 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      {feedback.timestamp.toLocaleDateString()}
                    </Layout.Flex>
                  </div>
                </Layout.Flex>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default FeedbackAnalyticsPanel