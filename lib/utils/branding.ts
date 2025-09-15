import { type BrandingConfig } from '../types/theme'

/**
 * Default branding configuration
 */
export const defaultBranding: BrandingConfig = {
  appName: 'Chat UI',
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  fontFamily: 'Inter',
}

/**
 * Load branding configuration from environment variables
 */
export function loadEnvironmentBranding(): Partial<BrandingConfig> {
  const envBranding: Partial<BrandingConfig> = {}

  // App name
  if (process.env.NEXT_PUBLIC_APP_NAME) {
    envBranding.appName = process.env.NEXT_PUBLIC_APP_NAME
  }

  // Colors
  if (process.env.NEXT_PUBLIC_PRIMARY_COLOR) {
    envBranding.primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR
  }

  if (process.env.NEXT_PUBLIC_SECONDARY_COLOR) {
    envBranding.secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR
  }

  // Typography
  if (process.env.NEXT_PUBLIC_FONT_FAMILY) {
    envBranding.fontFamily = process.env.NEXT_PUBLIC_FONT_FAMILY
  }

  // Logo
  if (process.env.NEXT_PUBLIC_LOGO_URL) {
    envBranding.logo = process.env.NEXT_PUBLIC_LOGO_URL
  }

  return envBranding
}

/**
 * Validate branding configuration
 */
export function validateBrandingConfig(branding: Partial<BrandingConfig>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validate colors (hex format)
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

  if (branding.primaryColor && !hexColorRegex.test(branding.primaryColor)) {
    errors.push('Primary color must be a valid hex color (e.g., #3b82f6)')
  }

  if (branding.secondaryColor && !hexColorRegex.test(branding.secondaryColor)) {
    errors.push('Secondary color must be a valid hex color (e.g., #64748b)')
  }

  // Validate app name
  if (branding.appName && (branding.appName.length < 1 || branding.appName.length > 50)) {
    errors.push('App name must be between 1 and 50 characters')
  }

  // Validate font family
  if (branding.fontFamily && branding.fontFamily.length < 1) {
    errors.push('Font family cannot be empty')
  }

  // Validate logo URL
  if (branding.logo) {
    try {
      new URL(branding.logo)
    } catch {
      // Check if it's a relative path
      if (!branding.logo.startsWith('/') && !branding.logo.startsWith('./')) {
        errors.push('Logo must be a valid URL or relative path')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Apply branding to CSS custom properties
 */
export function applyBrandingToDOM(branding: BrandingConfig): void {
  const root = document.documentElement

  // Apply colors
  if (branding.primaryColor) {
    root.style.setProperty('--color-primary-500', branding.primaryColor)
    
    // Generate color variations (simplified approach)
    const primaryRgb = hexToRgb(branding.primaryColor)
    if (primaryRgb) {
      // Lighter variations
      root.style.setProperty('--color-primary-50', `rgb(${Math.min(255, primaryRgb.r + 100)} ${Math.min(255, primaryRgb.g + 100)} ${Math.min(255, primaryRgb.b + 100)})`)
      root.style.setProperty('--color-primary-100', `rgb(${Math.min(255, primaryRgb.r + 80)} ${Math.min(255, primaryRgb.g + 80)} ${Math.min(255, primaryRgb.b + 80)})`)
      root.style.setProperty('--color-primary-200', `rgb(${Math.min(255, primaryRgb.r + 60)} ${Math.min(255, primaryRgb.g + 60)} ${Math.min(255, primaryRgb.b + 60)})`)
      
      // Darker variations
      root.style.setProperty('--color-primary-600', `rgb(${Math.max(0, primaryRgb.r - 20)} ${Math.max(0, primaryRgb.g - 20)} ${Math.max(0, primaryRgb.b - 20)})`)
      root.style.setProperty('--color-primary-700', `rgb(${Math.max(0, primaryRgb.r - 40)} ${Math.max(0, primaryRgb.g - 40)} ${Math.max(0, primaryRgb.b - 40)})`)
      root.style.setProperty('--color-primary-800', `rgb(${Math.max(0, primaryRgb.r - 60)} ${Math.max(0, primaryRgb.g - 60)} ${Math.max(0, primaryRgb.b - 60)})`)
      root.style.setProperty('--color-primary-900', `rgb(${Math.max(0, primaryRgb.r - 80)} ${Math.max(0, primaryRgb.g - 80)} ${Math.max(0, primaryRgb.b - 80)})`)
    }
  }

  if (branding.secondaryColor) {
    root.style.setProperty('--color-secondary-500', branding.secondaryColor)
  }

  // Apply font family
  if (branding.fontFamily) {
    root.style.setProperty('--font-sans', `${branding.fontFamily}, var(--font-sans)`)
  }
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Generate a color palette from a base color
 */
export function generateColorPalette(baseColor: string): Record<string, string> {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return {}

  const palette: Record<string, string> = {}
  
  // Generate lighter shades
  const lightSteps = [50, 100, 200, 300, 400]
  lightSteps.forEach((step, index) => {
    const factor = (5 - index) * 0.15 // 0.75, 0.6, 0.45, 0.3, 0.15
    palette[step] = `rgb(${Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor))} ${Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor))} ${Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor))})`
  })

  // Base color
  palette[500] = baseColor

  // Generate darker shades
  const darkSteps = [600, 700, 800, 900, 950]
  darkSteps.forEach((step, index) => {
    const factor = (index + 1) * 0.15 // 0.15, 0.3, 0.45, 0.6, 0.75
    palette[step] = `rgb(${Math.max(0, Math.round(rgb.r * (1 - factor)))} ${Math.max(0, Math.round(rgb.g * (1 - factor)))} ${Math.max(0, Math.round(rgb.b * (1 - factor)))})`
  })

  return palette
}

/**
 * Get contrast color (black or white) for a given background color
 */
export function getContrastColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return '#000000'

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

/**
 * Preview branding changes without applying them
 */
export function previewBranding(branding: Partial<BrandingConfig>): {
  cssVariables: Record<string, string>
  validation: ReturnType<typeof validateBrandingConfig>
} {
  const validation = validateBrandingConfig(branding)
  const cssVariables: Record<string, string> = {}

  if (validation.isValid) {
    if (branding.primaryColor) {
      const palette = generateColorPalette(branding.primaryColor)
      Object.entries(palette).forEach(([shade, color]) => {
        cssVariables[`--color-primary-${shade}`] = color
      })
    }

    if (branding.secondaryColor) {
      cssVariables['--color-secondary-500'] = branding.secondaryColor
    }

    if (branding.fontFamily) {
      cssVariables['--font-sans'] = `${branding.fontFamily}, var(--font-sans)`
    }
  }

  return {
    cssVariables,
    validation,
  }
}