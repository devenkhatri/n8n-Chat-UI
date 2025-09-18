'use client'

import { useTheme } from './use-theme'
import { useCallback, useEffect, useState } from 'react'
import { type UserPreferences } from '../lib/types/theme'
import { 
  loadPreferences, 
  savePreferences, 
  validatePreferences, 
  exportSettings, 
  importSettings,
  resetAllSettings,
  getStorageInfo 
} from '../lib/utils/preferences'

/**
 * Hook for advanced preference management
 */
export function usePreferences() {
  const { preferences, updatePreferences } = useTheme()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save preferences when they change
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (savePreferences(preferences)) {
        setLastSaved(new Date())
      }
    }, 500) // Debounce saves by 500ms

    return () => clearTimeout(saveTimeout)
  }, [preferences])

  // Export settings
  const exportUserSettings = useCallback(() => {
    try {
      const settings = exportSettings()
      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `chat-ui-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('Failed to export settings:', error)
      return false
    }
  }, [])

  // Import settings
  const importUserSettings = useCallback(async (file: File): Promise<{
    success: boolean
    errors: string[]
  }> => {
    setIsSyncing(true)
    
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      const result = importSettings(data)
      
      if (result.success) {
        // Reload preferences from storage
        const newPreferences = loadPreferences()
        updatePreferences(newPreferences)
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to parse settings file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    } finally {
      setIsSyncing(false)
    }
  }, [updatePreferences])

  // Reset all settings
  const resetSettings = useCallback(() => {
    if (resetAllSettings()) {
      // Reset to defaults
      updatePreferences({
        theme: 'system',
        fontSize: 'md',
        messageGrouping: true,
        soundEnabled: false,
        animationsEnabled: true,
        compactMode: false,
      })
      return true
    }
    return false
  }, [updatePreferences])

  // Validate current preferences
  const validation = validatePreferences(preferences)

  // Get storage information
  const storageInfo = getStorageInfo()

  return {
    // Current preferences
    preferences,
    updatePreferences,
    
    // Validation
    validation,
    isValid: validation.isValid,
    errors: validation.errors,
    
    // Sync status
    isSyncing,
    lastSaved,
    
    // Storage info
    storageInfo,
    
    // Actions
    exportUserSettings,
    importUserSettings,
    resetSettings,
  }
}

/**
 * Hook for preference-based CSS classes and styles
 */
export function usePreferenceStyles() {
  const { preferences } = useTheme()

  const getResponsiveClasses = useCallback(() => {
    const classes: string[] = []

    // Font size classes
    if (preferences.fontSize === 'sm') {
      classes.push('text-sm')
    } else if (preferences.fontSize === 'lg') {
      classes.push('text-lg')
    }

    // Compact mode classes
    if (preferences.compactMode) {
      classes.push('compact-mode')
    }

    return classes.join(' ')
  }, [preferences])

  const getAnimationClasses = useCallback(() => {
    return preferences.animationsEnabled 
      ? 'transition-all duration-200 ease-out' 
      : ''
  }, [preferences.animationsEnabled])

  const getSpacingClasses = useCallback(() => {
    return preferences.compactMode 
      ? 'space-y-2 p-2' 
      : 'space-y-4 p-4'
  }, [preferences.compactMode])

  return {
    responsiveClasses: getResponsiveClasses(),
    animationClasses: getAnimationClasses(),
    spacingClasses: getSpacingClasses(),
    
    // Individual preference checks
    isCompact: preferences.compactMode,
    hasAnimations: preferences.animationsEnabled,
    hasSound: preferences.soundEnabled,
    hasGrouping: preferences.messageGrouping,
    fontSize: preferences.fontSize,
  }
}

/**
 * Hook for accessibility preferences
 */
export function useAccessibilityPreferences() {
  const { preferences } = useTheme()
  const [systemPreferences, setSystemPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersColorScheme: 'light' as 'light' | 'dark',
  })

  // Detect system accessibility preferences
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateSystemPreferences = () => {
      setSystemPreferences({
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      })
    }

    // Initial check
    updateSystemPreferences()

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
    ]

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updateSystemPreferences)
    })

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updateSystemPreferences)
      })
    }
  }, [])

  // Determine effective accessibility settings
  const effectiveSettings = {
    // Animations: disabled if user disabled OR system prefers reduced motion
    animationsEnabled: preferences.animationsEnabled && !systemPreferences.prefersReducedMotion,
    
    // High contrast: enabled if system prefers it
    highContrast: systemPreferences.prefersHighContrast,
    
    // Other preferences
    soundEnabled: preferences.soundEnabled,
    fontSize: preferences.fontSize,
    compactMode: preferences.compactMode,
  }

  return {
    // User preferences
    userPreferences: preferences,
    
    // System preferences
    systemPreferences,
    
    // Effective settings (user + system)
    effectiveSettings,
    
    // Accessibility helpers
    shouldReduceMotion: !effectiveSettings.animationsEnabled,
    shouldUseHighContrast: effectiveSettings.highContrast,
    isAccessibilityOptimized: !effectiveSettings.animationsEnabled || effectiveSettings.highContrast,
  }
}