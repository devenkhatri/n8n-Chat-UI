import { type UserPreferences, type BrandingConfig } from '../types/theme'

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'ui-theme',
  PREFERENCES: 'ui-preferences',
  BRANDING: 'ui-branding',
} as const

// Default values
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  fontSize: 'md',
  messageGrouping: true,
  soundEnabled: false,
  animationsEnabled: true,
  compactMode: false,
}

export const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'Chat UI',
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  fontFamily: 'Inter',
}

/**
 * Safely parse JSON from localStorage
 */
function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

/**
 * Safely stringify and store JSON to localStorage
 */
function safeStringifyJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error)
    return false
  }
}

/**
 * Load user preferences from localStorage
 */
export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  
  const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
  const parsed = safeParseJSON(stored, {})
  
  // Merge with defaults to ensure all properties exist
  return { ...DEFAULT_PREFERENCES, ...parsed }
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: UserPreferences): boolean {
  if (typeof window === 'undefined') return false
  
  return safeStringifyJSON(STORAGE_KEYS.PREFERENCES, preferences)
}

/**
 * Load branding configuration from localStorage
 */
export function loadBranding(): BrandingConfig {
  if (typeof window === 'undefined') return DEFAULT_BRANDING
  
  const stored = localStorage.getItem(STORAGE_KEYS.BRANDING)
  const parsed = safeParseJSON(stored, {})
  
  // Merge with defaults to ensure all properties exist
  return { ...DEFAULT_BRANDING, ...parsed }
}

/**
 * Save branding configuration to localStorage
 */
export function saveBranding(branding: BrandingConfig): boolean {
  if (typeof window === 'undefined') return false
  
  return safeStringifyJSON(STORAGE_KEYS.BRANDING, branding)
}

/**
 * Export preferences and branding as JSON
 */
export function exportSettings(): {
  preferences: UserPreferences
  branding: BrandingConfig
  exportedAt: string
} {
  return {
    preferences: loadPreferences(),
    branding: loadBranding(),
    exportedAt: new Date().toISOString(),
  }
}

/**
 * Import preferences and branding from JSON
 */
export function importSettings(data: {
  preferences?: Partial<UserPreferences>
  branding?: Partial<BrandingConfig>
}): {
  success: boolean
  errors: string[]
} {
  const errors: string[] = []
  let success = true

  try {
    // Import preferences
    if (data.preferences) {
      const currentPreferences = loadPreferences()
      const newPreferences = { ...currentPreferences, ...data.preferences }
      
      if (!savePreferences(newPreferences)) {
        errors.push('Failed to save preferences')
        success = false
      }
    }

    // Import branding
    if (data.branding) {
      const currentBranding = loadBranding()
      const newBranding = { ...currentBranding, ...data.branding }
      
      if (!saveBranding(newBranding)) {
        errors.push('Failed to save branding')
        success = false
      }
    }
  } catch (error) {
    errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    success = false
  }

  return { success, errors }
}

/**
 * Reset all settings to defaults
 */
export function resetAllSettings(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES)
    localStorage.removeItem(STORAGE_KEYS.BRANDING)
    localStorage.removeItem(STORAGE_KEYS.THEME)
    return true
  } catch (error) {
    console.error('Failed to reset settings:', error)
    return false
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  used: number
  available: number
  percentage: number
  canStore: boolean
} {
  if (typeof window === 'undefined') {
    return { used: 0, available: 0, percentage: 0, canStore: false }
  }

  try {
    // Estimate storage usage
    let used = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    // Most browsers allow ~5-10MB for localStorage
    const available = 5 * 1024 * 1024 // 5MB estimate
    const percentage = (used / available) * 100

    return {
      used,
      available,
      percentage: Math.min(percentage, 100),
      canStore: percentage < 90, // Consider storage full at 90%
    }
  } catch {
    return { used: 0, available: 0, percentage: 0, canStore: false }
  }
}

/**
 * Validate preferences object
 */
export function validatePreferences(preferences: Partial<UserPreferences>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validate theme
  if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
    errors.push('Invalid theme value')
  }

  // Validate fontSize
  if (preferences.fontSize && !['sm', 'md', 'lg'].includes(preferences.fontSize)) {
    errors.push('Invalid fontSize value')
  }

  // Validate boolean fields
  const booleanFields: (keyof UserPreferences)[] = [
    'messageGrouping',
    'soundEnabled',
    'animationsEnabled',
    'compactMode'
  ]

  booleanFields.forEach(field => {
    if (preferences[field] !== undefined && typeof preferences[field] !== 'boolean') {
      errors.push(`Invalid ${field} value - must be boolean`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Migrate old preference formats to current format
 */
export function migratePreferences(): boolean {
  try {
    // Check for old theme storage format
    const oldTheme = localStorage.getItem('theme')
    if (oldTheme && !localStorage.getItem(STORAGE_KEYS.THEME)) {
      localStorage.setItem(STORAGE_KEYS.THEME, oldTheme)
      localStorage.removeItem('theme')
    }

    // Add more migration logic here as needed
    return true
  } catch (error) {
    console.error('Failed to migrate preferences:', error)
    return false
  }
}