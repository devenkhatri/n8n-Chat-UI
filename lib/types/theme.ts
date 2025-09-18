export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
  typography: {
    fontFamily: string
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
}

export interface BrandingConfig {
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  appName?: string
}

export interface UserPreferences {
  theme: ThemeMode
  fontSize: 'sm' | 'md' | 'lg'
  messageGrouping: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  compactMode: boolean
  customBranding?: BrandingConfig
}

export interface ThemeContextValue {
  // Current theme state
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  systemTheme: 'light' | 'dark'
  
  // Theme actions
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  
  // User preferences
  preferences: UserPreferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  
  // Branding
  branding: BrandingConfig
  updateBranding: (branding: Partial<BrandingConfig>) => void
  
  // Utilities
  isLoading: boolean
}