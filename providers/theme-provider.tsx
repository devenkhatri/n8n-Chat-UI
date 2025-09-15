'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

interface BrandingConfig {
  appName?: string
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  logo?: string
}

interface UserPreferences {
  theme: ThemeMode
  fontSize: 'sm' | 'md' | 'lg'
  messageGrouping: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  compactMode: boolean
}

interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  systemTheme: 'light' | 'dark'
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  preferences: UserPreferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  branding: BrandingConfig
  updateBranding: (branding: Partial<BrandingConfig>) => void
  isLoading: boolean
}

const THEME_STORAGE_KEY = 'ui-theme'
const PREFERENCES_STORAGE_KEY = 'ui-preferences'
const BRANDING_STORAGE_KEY = 'ui-branding'

const defaultPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 'md',
  messageGrouping: true,
  soundEnabled: false,
  animationsEnabled: true,
  compactMode: false,
}

const defaultBranding: BrandingConfig = {
  appName: 'Chat UI',
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  fontFamily: 'Inter',
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  storageKey?: string
  enableSystem?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [preferences, setPreferencesState] = useState<UserPreferences>(defaultPreferences)
  const [branding, setBrandingState] = useState<BrandingConfig>(defaultBranding)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Get the resolved theme (actual theme being used)
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  // Initialize theme from storage and system preferences
  useEffect(() => {
    setMounted(true)
    
    const initializeTheme = () => {
      try {
        // Load saved theme
        const savedTheme = localStorage.getItem(storageKey) as ThemeMode | null
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme)
        }

        // Load saved preferences
        const savedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY)
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences)
          setPreferencesState({ ...defaultPreferences, ...parsed })
        }

        // Load saved branding
        const savedBranding = localStorage.getItem(BRANDING_STORAGE_KEY)
        if (savedBranding) {
          const parsed = JSON.parse(savedBranding)
          setBrandingState({ ...defaultBranding, ...parsed })
        }

        // Load environment-based branding
        const envBranding: Partial<BrandingConfig> = {}
        if (process.env.NEXT_PUBLIC_APP_NAME) {
          envBranding.appName = process.env.NEXT_PUBLIC_APP_NAME
        }
        if (process.env.NEXT_PUBLIC_PRIMARY_COLOR) {
          envBranding.primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR
        }
        if (Object.keys(envBranding).length > 0) {
          setBrandingState(prev => ({ ...prev, ...envBranding }))
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize theme:', error)
        setIsLoading(false)
      }
    }

    initializeTheme()
  }, [storageKey])

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || !mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [enableSystem, mounted])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add current theme class
    root.classList.add(resolvedTheme)

    // Apply custom branding (simplified)
    if (branding.primaryColor) {
      root.style.setProperty('--color-primary', branding.primaryColor)
    }
    if (branding.secondaryColor) {
      root.style.setProperty('--color-secondary', branding.secondaryColor)
    }

    // Apply accessibility preferences
    if (!preferences.animationsEnabled) {
      root.style.setProperty('--duration-150', '0ms')
      root.style.setProperty('--duration-200', '0ms')
      root.style.setProperty('--duration-300', '0ms')
      root.style.setProperty('--duration-500', '0ms')
    }

    // Apply font size preference
    const fontSizeMap = {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    }
    root.style.setProperty('--text-base', fontSizeMap[preferences.fontSize])

  }, [mounted, resolvedTheme, branding, preferences.animationsEnabled, preferences.fontSize])

  // Theme management functions
  const setTheme = useCallback((newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme)
      localStorage.setItem(storageKey, newTheme)
      
      // Update preferences as well
      const updatedPreferences = { ...preferences, theme: newTheme }
      setPreferencesState(updatedPreferences)
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updatedPreferences))
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }, [storageKey, preferences])

  const toggleTheme = useCallback(() => {
    const currentResolved = theme === 'system' ? systemTheme : theme
    const newTheme = currentResolved === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [theme, systemTheme, setTheme])

  const updatePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences }
      setPreferencesState(updatedPreferences)
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updatedPreferences))
      
      // If theme preference changed, update theme as well
      if (newPreferences.theme && newPreferences.theme !== theme) {
        setThemeState(newPreferences.theme)
        localStorage.setItem(storageKey, newPreferences.theme)
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }, [preferences, theme, storageKey])

  const updateBranding = useCallback((newBranding: Partial<BrandingConfig>) => {
    try {
      const updatedBranding = { ...branding, ...newBranding }
      setBrandingState(updatedBranding)
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(updatedBranding))
    } catch (error) {
      console.error('Failed to save branding:', error)
    }
  }, [branding])

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    preferences,
    updatePreferences,
    branding,
    updateBranding,
    isLoading,
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {children}
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}