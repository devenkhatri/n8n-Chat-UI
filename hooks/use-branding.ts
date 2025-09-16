'use client'

import { useTheme } from './use-theme'
import { useCallback, useMemo } from 'react'
import { type BrandingConfig } from '../lib/types/theme'
import { validateBrandingConfig, previewBranding, generateColorPalette, getContrastColor } from '../lib/utils/branding'

/**
 * Hook for branding management and utilities
 */
export function useBranding() {
  // Establish branding and updater with safe fallback if provider missing
  let branding: BrandingConfig & { logo?: string }
  let updateBranding: (changes: Partial<BrandingConfig & { logo?: string }>) => void

  try {
    const theme = useTheme()
    branding = theme.branding as BrandingConfig & { logo?: string }
    updateBranding = theme.updateBranding as (changes: Partial<BrandingConfig & { logo?: string }>) => void
  } catch {
    branding = {
      appName: 'Chat UI',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      fontFamily: 'Inter',
    }
    updateBranding = () => {}
  }

  // Validation utilities
  const validation = useMemo(() => validateBrandingConfig(branding), [branding])

  // Preview utilities
  const preview = useMemo(() => previewBranding(branding), [branding])

  // Color utilities
  const primaryPalette = useMemo(() => {
    return branding.primaryColor ? generateColorPalette(branding.primaryColor) : {}
  }, [branding.primaryColor])

  const secondaryPalette = useMemo(() => {
    return branding.secondaryColor ? generateColorPalette(branding.secondaryColor) : {}
  }, [branding.secondaryColor])

  // Contrast utilities
  const primaryContrast = useMemo(() => {
    return branding.primaryColor ? getContrastColor(branding.primaryColor) : '#ffffff'
  }, [branding.primaryColor])

  const secondaryContrast = useMemo(() => {
    return branding.secondaryColor ? getContrastColor(branding.secondaryColor) : '#000000'
  }, [branding.secondaryColor])

  // Update specific branding properties
  const updateAppName = useCallback((appName: string) => {
    updateBranding({ appName })
  }, [updateBranding])

  const updatePrimaryColor = useCallback((primaryColor: string) => {
    updateBranding({ primaryColor })
  }, [updateBranding])

  const updateSecondaryColor = useCallback((secondaryColor: string) => {
    updateBranding({ secondaryColor })
  }, [updateBranding])

  const updateFontFamily = useCallback((fontFamily: string) => {
    updateBranding({ fontFamily })
  }, [updateBranding])

  const updateLogo = useCallback((logo: string) => {
    updateBranding({ logo })
  }, [updateBranding])

  // Reset branding to defaults
  const resetBranding = useCallback(() => {
    updateBranding({
      appName: 'Chat UI',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      fontFamily: 'Inter',
      logo: undefined,
    })
  }, [updateBranding])

  // Apply multiple branding changes at once
  const applyBrandingChanges = useCallback((changes: Partial<BrandingConfig>) => {
    updateBranding(changes)
  }, [updateBranding])

  return {
    // Current branding
    branding,
    
    // Validation
    validation,
    isValid: validation.isValid,
    errors: validation.errors,
    
    // Preview
    preview,
    previewStyles: preview.cssVariables,
    
    // Color palettes
    primaryPalette,
    secondaryPalette,
    primaryContrast,
    secondaryContrast,
    
    // Update functions
    updateBranding,
    updateAppName,
    updatePrimaryColor,
    updateSecondaryColor,
    updateFontFamily,
    updateLogo,
    resetBranding,
    applyBrandingChanges,
  }
}

/**
 * Hook for getting branding-aware CSS classes
 */
export function useBrandingClasses() {
  const { branding } = useBranding()

  return {
    // App name for titles
    appName: branding.appName || 'Chat UI',
    
    // Logo utilities
    hasLogo: Boolean(branding.logo),
    logoUrl: branding.logo,
    
    // Font utilities
    fontFamily: branding.fontFamily || 'Inter',
    
    // Color utilities
    primaryColor: branding.primaryColor || '#3b82f6',
    secondaryColor: branding.secondaryColor || '#64748b',
    
    // CSS custom property values
    cssVars: {
      '--brand-primary': branding.primaryColor || '#3b82f6',
      '--brand-secondary': branding.secondaryColor || '#64748b',
      '--brand-font': branding.fontFamily || 'Inter',
    } as React.CSSProperties,
  }
}

/**
 * Hook for environment-based branding detection
 */
export function useEnvironmentBranding() {
  const envBranding = useMemo(() => {
    if (typeof window === 'undefined') return {}
    
    return {
      appName: process.env.NEXT_PUBLIC_APP_NAME,
      primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
      secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR,
      fontFamily: process.env.NEXT_PUBLIC_FONT_FAMILY,
      logo: process.env.NEXT_PUBLIC_LOGO_URL,
    }
  }, [])

  const hasEnvironmentBranding = Object.values(envBranding).some(Boolean)

  return {
    envBranding,
    hasEnvironmentBranding,
    isEnvironmentConfigured: hasEnvironmentBranding,
  }
}