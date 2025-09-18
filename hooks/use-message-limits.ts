'use client'

import { useState, useEffect, useCallback } from 'react'

export interface MessageLimitConfig {
  total: number
  remaining: number
  resetTime?: Date
  plan: 'free' | 'pro' | 'premium'
  features: {
    unlimitedMessages: boolean
    prioritySupport: boolean
    advancedFeatures: boolean
    exportConversations: boolean
    customThemes: boolean
    apiAccess: boolean
    teamCollaboration: boolean
  }
}

export interface UseMessageLimitsReturn {
  // State
  config: MessageLimitConfig
  loading: boolean
  error: string | null
  
  // Computed values
  percentage: number
  isEmpty: boolean
  isLow: boolean
  isVeryLow: boolean
  canSend: boolean
  timeUntilReset?: string
  
  // Actions
  consumeMessage: () => Promise<boolean>
  resetLimits: () => Promise<void>
  upgradePlan: (plan: 'pro' | 'premium') => Promise<void>
  refreshLimits: () => Promise<void>
  
  // Utilities
  getUpgradeRecommendation: () => 'pro' | 'premium'
  getAlternativeActions: () => Array<{
    label: string
    action: () => void
    variant: 'primary' | 'secondary'
  }>
}

const DEFAULT_CONFIG: MessageLimitConfig = {
  total: 5,
  remaining: 5,
  plan: 'free',
  features: {
    unlimitedMessages: false,
    prioritySupport: false,
    advancedFeatures: false,
    exportConversations: false,
    customThemes: false,
    apiAccess: false,
    teamCollaboration: false
  }
}

const PLAN_CONFIGS = {
  free: {
    total: 5,
    features: {
      unlimitedMessages: false,
      prioritySupport: false,
      advancedFeatures: false,
      exportConversations: false,
      customThemes: false,
      apiAccess: false,
      teamCollaboration: false
    }
  },
  pro: {
    total: 500,
    features: {
      unlimitedMessages: false,
      prioritySupport: true,
      advancedFeatures: true,
      exportConversations: true,
      customThemes: true,
      apiAccess: false,
      teamCollaboration: false
    }
  },
  premium: {
    total: Infinity,
    features: {
      unlimitedMessages: true,
      prioritySupport: true,
      advancedFeatures: true,
      exportConversations: true,
      customThemes: true,
      apiAccess: true,
      teamCollaboration: true
    }
  }
}

export function useMessageLimits(): UseMessageLimitsReturn {
  const [config, setConfig] = useState<MessageLimitConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Computed values
  const percentage = config.total === Infinity ? 100 : (config.remaining / config.total) * 100
  const isEmpty = config.remaining === 0
  const isLow = percentage <= 20 && !config.features.unlimitedMessages
  const isVeryLow = percentage <= 10 && !config.features.unlimitedMessages
  const canSend = config.remaining > 0 || config.features.unlimitedMessages

  const timeUntilReset = config.resetTime ? getTimeUntilReset(config.resetTime) : undefined

  // Load initial config
  useEffect(() => {
    refreshLimits()
  }, [])

  const refreshLimits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // In a real app, this would fetch from an API
      // For now, we'll simulate with localStorage
      const stored = localStorage.getItem('message-limits')
      if (stored) {
        const parsed = JSON.parse(stored)
        setConfig({
          ...parsed,
          resetTime: parsed.resetTime ? new Date(parsed.resetTime) : undefined
        })
      } else {
        // Initialize with default config
        const initialConfig = {
          ...DEFAULT_CONFIG,
          resetTime: getNextResetTime()
        }
        localStorage.setItem('message-limits', JSON.stringify(initialConfig))
        setConfig(initialConfig)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load message limits')
    } finally {
      setLoading(false)
    }
  }, [])

  const consumeMessage = useCallback(async (): Promise<boolean> => {
    if (!canSend) return false

    try {
      setError(null)
      
      // Don't consume if unlimited
      if (config.features.unlimitedMessages) return true
      
      const newConfig = {
        ...config,
        remaining: Math.max(0, config.remaining - 1)
      }
      
      localStorage.setItem('message-limits', JSON.stringify(newConfig))
      setConfig(newConfig)
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to consume message')
      return false
    }
  }, [config, canSend])

  const resetLimits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const planConfig = PLAN_CONFIGS[config.plan]
      const newConfig = {
        ...config,
        remaining: planConfig.total,
        resetTime: getNextResetTime()
      }
      
      localStorage.setItem('message-limits', JSON.stringify(newConfig))
      setConfig(newConfig)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset limits')
    } finally {
      setLoading(false)
    }
  }, [config])

  const upgradePlan = useCallback(async (plan: 'pro' | 'premium') => {
    try {
      setLoading(true)
      setError(null)
      
      const planConfig = PLAN_CONFIGS[plan]
      const newConfig: MessageLimitConfig = {
        ...config,
        plan,
        total: planConfig.total,
        remaining: planConfig.total,
        features: planConfig.features,
        resetTime: plan === 'premium' ? undefined : getNextResetTime()
      }
      
      localStorage.setItem('message-limits', JSON.stringify(newConfig))
      setConfig(newConfig)
      
      // In a real app, this would call a payment API
      console.log(`Upgraded to ${plan} plan`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade plan')
    } finally {
      setLoading(false)
    }
  }, [config])

  const getUpgradeRecommendation = useCallback((): 'pro' | 'premium' => {
    // Recommend premium if user is a heavy user (used more than 80% of free messages)
    const usagePercentage = ((config.total - config.remaining) / config.total) * 100
    return usagePercentage > 80 ? 'premium' : 'pro'
  }, [config])

  const getAlternativeActions = useCallback(() => {
    const actions = []
    
    if (isEmpty) {
      actions.push({
        label: 'Reset Session',
        action: resetLimits,
        variant: 'secondary' as const
      })
      
      actions.push({
        label: 'Upgrade Plan',
        action: () => {}, // This would trigger upgrade modal
        variant: 'primary' as const
      })
    } else if (isLow) {
      actions.push({
        label: 'Upgrade for Unlimited',
        action: () => {}, // This would trigger upgrade modal
        variant: 'primary' as const
      })
    }
    
    return actions
  }, [isEmpty, isLow, resetLimits])

  return {
    // State
    config,
    loading,
    error,
    
    // Computed values
    percentage,
    isEmpty,
    isLow,
    isVeryLow,
    canSend,
    timeUntilReset,
    
    // Actions
    consumeMessage,
    resetLimits,
    upgradePlan,
    refreshLimits,
    
    // Utilities
    getUpgradeRecommendation,
    getAlternativeActions
  }
}

// Utility functions
function getNextResetTime(): Date {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow
}

function getTimeUntilReset(resetTime: Date): string {
  const now = new Date()
  const diff = resetTime.getTime() - now.getTime()
  
  if (diff <= 0) return 'Now'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}