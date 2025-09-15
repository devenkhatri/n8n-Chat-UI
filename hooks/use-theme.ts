'use client'

import { useTheme as useThemeContext } from '../providers/theme-provider'
import { useCallback, useEffect, useState } from 'react'
import { type ThemeMode } from '../lib/types/theme'

/**
 * Enhanced theme hook with additional utilities
 */
export function useTheme() {
  try {
    const context = useThemeContext()
    const [mounted, setMounted] = useState(false)

  // Ensure we're mounted to avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Utility to check if current theme is dark
  const isDark = context.resolvedTheme === 'dark'
  
  // Utility to check if current theme is light
  const isLight = context.resolvedTheme === 'light'
  
  // Utility to check if system theme is being used
  const isSystem = context.theme === 'system'

  // Cycle through themes: light -> dark -> system -> light
  const cycleTheme = useCallback(() => {
    const themeOrder: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = themeOrder.indexOf(context.theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    context.setTheme(themeOrder[nextIndex])
  }, [context])

  // Get theme icon for current state
  const getThemeIcon = useCallback(() => {
    if (!mounted) return 'sun' // Default for SSR
    
    switch (context.theme) {
      case 'light':
        return 'sun'
      case 'dark':
        return 'moon'
      case 'system':
        return 'monitor'
      default:
        return 'sun'
    }
  }, [context.theme, mounted])

  // Get theme label for current state
  const getThemeLabel = useCallback(() => {
    switch (context.theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
      default:
        return 'Light'
    }
  }, [context.theme])

  // Check if animations should be enabled
  const shouldAnimate = context.preferences.animationsEnabled && mounted

  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  // Final animation state considering both user preference and system preference
  const animationsEnabled = shouldAnimate && !prefersReducedMotion

    return {
      ...context,
      // Additional utilities
      mounted,
      isDark,
      isLight,
      isSystem,
      cycleTheme,
      getThemeIcon,
      getThemeLabel,
      animationsEnabled,
      prefersReducedMotion,
    }
  } catch (error) {
    // Fallback if theme provider is not available
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
      setMounted(true)
    }, [])
    
    return {
      theme: 'light' as const,
      resolvedTheme: 'light' as const,
      systemTheme: 'light' as const,
      setTheme: () => {},
      toggleTheme: () => {},
      preferences: {
        theme: 'light' as const,
        fontSize: 'md' as const,
        messageGrouping: true,
        soundEnabled: false,
        animationsEnabled: true,
        compactMode: false,
      },
      updatePreferences: () => {},
      branding: {
        appName: 'Chat UI',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        fontFamily: 'Inter',
      },
      updateBranding: () => {},
      isLoading: false,
      mounted,
      isDark: false,
      isLight: true,
      isSystem: false,
      cycleTheme: () => {},
      getThemeIcon: () => 'sun',
      getThemeLabel: () => 'Light',
      animationsEnabled: true,
      prefersReducedMotion: false,
    }
  }
}

/**
 * Hook for theme-aware CSS classes
 */
export function useThemeClasses() {
  const { resolvedTheme, mounted } = useTheme()

  return {
    // Base theme classes
    theme: mounted ? resolvedTheme : 'light',
    
    // Conditional classes
    light: mounted && resolvedTheme === 'light',
    dark: mounted && resolvedTheme === 'dark',
    
    // CSS class strings
    themeClass: mounted ? resolvedTheme : 'light',
    conditionalClass: (lightClass: string, darkClass: string) => 
      mounted && resolvedTheme === 'dark' ? darkClass : lightClass,
  }
}

/**
 * Hook for system theme detection
 */
export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial value
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return {
    systemTheme,
    mounted,
    isDarkSystem: mounted && systemTheme === 'dark',
    isLightSystem: mounted && systemTheme === 'light',
  }
}