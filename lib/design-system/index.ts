// Design System exports
export { designTokens, type DesignTokens } from './tokens'

// Component variants
export { buttonVariants, type ButtonVariants } from '../variants/button'
export { inputVariants, inputLabelVariants, inputHelperVariants, type InputVariants, type InputLabelVariants, type InputHelperVariants } from '../variants/input'
export { cardVariants, type CardVariants } from '../variants/card'

// Types
export type * from '../types/ui'

// Utilities
export { cn } from '../utils'

// Design system configuration
import { designTokens } from './tokens'

export const designSystem = {
  name: 'n8n Chat UI Design System',
  version: '1.0.0',
  description: 'A modern, accessible design system for chat interfaces',
  tokens: designTokens,
} as const

export type DesignSystem = typeof designSystem