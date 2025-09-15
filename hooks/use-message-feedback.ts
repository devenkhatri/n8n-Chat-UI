'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageFeedback } from '../components/ui/message-feedback'

export interface FeedbackEntry {
  id: string
  messageId: string
  rating: 'positive' | 'negative'
  comment?: string
  timestamp: Date
  messagePreview: string
}

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

export interface UseMessageFeedbackReturn {
  // State
  feedback: Record<string, MessageFeedback>
  stats: FeedbackStats
  recentFeedback: FeedbackEntry[]
  loading: boolean
  error: string | null
  
  // Actions
  submitFeedback: (messageId: string, rating: 'positive' | 'negative', comment?: string, messagePreview?: string) => Promise<void>
  removeFeedback: (messageId: string) => Promise<void>
  getFeedback: (messageId: string) => MessageFeedback | undefined
  loadFeedbackStats: (timeRange?: '7d' | '30d' | '90d' | 'all') => Promise<void>
  exportFeedback: (format: 'json' | 'csv') => Promise<string>
  
  // Utilities
  hasFeedback: (messageId: string) => boolean
  getFeedbackSummary: () => { positive: number; negative: number; total: number }
}

const STORAGE_KEY = 'message-feedback'
const STORAGE_VERSION = '1.0'

interface FeedbackStorage {
  version: string
  feedback: Record<string, MessageFeedback>
  entries: FeedbackEntry[]
  metadata: {
    lastUpdated: string
    totalEntries: number
  }
}

export function useMessageFeedback(): UseMessageFeedbackReturn {
  const [feedback, setFeedback] = useState<Record<string, MessageFeedback>>({})
  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    positiveCount: 0,
    negativeCount: 0,
    positivePercentage: 0,
    negativePercentage: 0,
    commentsCount: 0,
    averageRating: 0,
    trend: 'stable',
    trendPercentage: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load feedback from storage
  const loadFeedback = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: FeedbackStorage = JSON.parse(stored)
        
        // Convert date strings back to Date objects
        const feedbackWithDates: Record<string, MessageFeedback> = {}
        Object.entries(data.feedback).forEach(([messageId, fb]) => {
          feedbackWithDates[messageId] = {
            ...fb,
            timestamp: new Date(fb.timestamp)
          }
        })
        
        const entriesWithDates = data.entries.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
        
        setFeedback(feedbackWithDates)
        setEntries(entriesWithDates)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }, [])

  // Save feedback to storage
  const saveFeedback = useCallback(async (newFeedback: Record<string, MessageFeedback>, newEntries: FeedbackEntry[]) => {
    try {
      const data: FeedbackStorage = {
        version: STORAGE_VERSION,
        feedback: newFeedback,
        entries: newEntries,
        metadata: {
          lastUpdated: new Date().toISOString(),
          totalEntries: newEntries.length
        }
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      throw new Error('Failed to save feedback')
    }
  }, [])

  // Calculate stats
  const calculateStats = useCallback((feedbackData: Record<string, MessageFeedback>, timeRange: '7d' | '30d' | '90d' | 'all' = 'all') => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
      default:
        cutoffDate.setFullYear(2000) // Include all
    }
    
    const relevantFeedback = Object.values(feedbackData).filter(
      fb => fb.timestamp >= cutoffDate
    )
    
    const totalFeedback = relevantFeedback.length
    const positiveCount = relevantFeedback.filter(fb => fb.rating === 'positive').length
    const negativeCount = relevantFeedback.filter(fb => fb.rating === 'negative').length
    const commentsCount = relevantFeedback.filter(fb => fb.comment).length
    
    const positivePercentage = totalFeedback > 0 ? (positiveCount / totalFeedback) * 100 : 0
    const negativePercentage = totalFeedback > 0 ? (negativeCount / totalFeedback) * 100 : 0
    
    // Calculate average rating (positive = 5, negative = 1)
    const averageRating = totalFeedback > 0 
      ? ((positiveCount * 5 + negativeCount * 1) / totalFeedback)
      : 0
    
    // Calculate trend (simplified - compare with previous period)
    const previousCutoff = new Date(cutoffDate)
    const periodLength = now.getTime() - cutoffDate.getTime()
    previousCutoff.setTime(cutoffDate.getTime() - periodLength)
    
    const previousFeedback = Object.values(feedbackData).filter(
      fb => fb.timestamp >= previousCutoff && fb.timestamp < cutoffDate
    )
    
    const previousPositivePercentage = previousFeedback.length > 0
      ? (previousFeedback.filter(fb => fb.rating === 'positive').length / previousFeedback.length) * 100
      : 0
    
    const trendPercentage = positivePercentage - previousPositivePercentage
    const trend: 'up' | 'down' | 'stable' = 
      Math.abs(trendPercentage) < 1 ? 'stable' :
      trendPercentage > 0 ? 'up' : 'down'
    
    return {
      totalFeedback,
      positiveCount,
      negativeCount,
      positivePercentage,
      negativePercentage,
      commentsCount,
      averageRating,
      trend,
      trendPercentage: Math.abs(trendPercentage)
    }
  }, [])

  // Submit feedback
  const submitFeedback = useCallback(async (
    messageId: string, 
    rating: 'positive' | 'negative', 
    comment?: string,
    messagePreview?: string
  ) => {
    try {
      setError(null)
      
      const newFeedback: MessageFeedback = {
        rating,
        comment,
        timestamp: new Date()
      }
      
      const newFeedbackRecord = {
        ...feedback,
        [messageId]: newFeedback
      }
      
      const newEntry: FeedbackEntry = {
        id: crypto.randomUUID(),
        messageId,
        rating,
        comment,
        timestamp: new Date(),
        messagePreview: messagePreview || 'Message content'
      }
      
      const newEntries = [newEntry, ...entries].slice(0, 100) // Keep last 100 entries
      
      await saveFeedback(newFeedbackRecord, newEntries)
      setFeedback(newFeedbackRecord)
      setEntries(newEntries)
      
      // Update stats
      const newStats = calculateStats(newFeedbackRecord)
      setStats(newStats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
      throw err
    }
  }, [feedback, entries, saveFeedback, calculateStats])

  // Remove feedback
  const removeFeedback = useCallback(async (messageId: string) => {
    try {
      setError(null)
      
      const newFeedbackRecord = { ...feedback }
      delete newFeedbackRecord[messageId]
      
      const newEntries = entries.filter(entry => entry.messageId !== messageId)
      
      await saveFeedback(newFeedbackRecord, newEntries)
      setFeedback(newFeedbackRecord)
      setEntries(newEntries)
      
      // Update stats
      const newStats = calculateStats(newFeedbackRecord)
      setStats(newStats)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove feedback')
      throw err
    }
  }, [feedback, entries, saveFeedback, calculateStats])

  // Get feedback for specific message
  const getFeedback = useCallback((messageId: string): MessageFeedback | undefined => {
    return feedback[messageId]
  }, [feedback])

  // Load feedback stats for time range
  const loadFeedbackStats = useCallback(async (timeRange: '7d' | '30d' | '90d' | 'all' = 'all') => {
    try {
      setLoading(true)
      const newStats = calculateStats(feedback, timeRange)
      setStats(newStats)
    } finally {
      setLoading(false)
    }
  }, [feedback, calculateStats])

  // Export feedback
  const exportFeedback = useCallback(async (format: 'json' | 'csv'): Promise<string> => {
    if (format === 'json') {
      return JSON.stringify({
        feedback,
        entries,
        stats,
        exportedAt: new Date().toISOString()
      }, null, 2)
    } else {
      // CSV format
      const headers = ['Message ID', 'Rating', 'Comment', 'Timestamp', 'Message Preview']
      const rows = entries.map(entry => [
        entry.messageId,
        entry.rating,
        entry.comment || '',
        entry.timestamp.toISOString(),
        entry.messagePreview
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      return csvContent
    }
  }, [feedback, entries, stats])

  // Utility functions
  const hasFeedback = useCallback((messageId: string): boolean => {
    return messageId in feedback
  }, [feedback])

  const getFeedbackSummary = useCallback(() => {
    const total = Object.keys(feedback).length
    const positive = Object.values(feedback).filter(fb => fb.rating === 'positive').length
    const negative = total - positive
    
    return { positive, negative, total }
  }, [feedback])

  // Get recent feedback (last 10 entries)
  const recentFeedback = entries.slice(0, 10)

  // Load feedback on mount
  useEffect(() => {
    loadFeedback()
  }, [loadFeedback])

  // Update stats when feedback changes
  useEffect(() => {
    const newStats = calculateStats(feedback)
    setStats(newStats)
  }, [feedback, calculateStats])

  return {
    // State
    feedback,
    stats,
    recentFeedback,
    loading,
    error,
    
    // Actions
    submitFeedback,
    removeFeedback,
    getFeedback,
    loadFeedbackStats,
    exportFeedback,
    
    // Utilities
    hasFeedback,
    getFeedbackSummary
  }
}