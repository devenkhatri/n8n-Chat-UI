import { type VariantProps } from "class-variance-authority"
import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react"

// Base component props
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

// Button component types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
}

// Input component types
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseComponentProps {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  required?: boolean
}

// Card component types
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'interactive'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto'
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
  tabIndex?: number
  role?: string
  'aria-label'?: string
}

// Chat message types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error' | 'regenerating'
  metadata?: {
    tokens?: number
    processingTime?: number
    model?: string
  }
  feedback?: {
    rating: 'positive' | 'negative'
    comment?: string
  }
}

// Chat message component props
export interface ChatMessageProps extends BaseComponentProps {
  message: ChatMessage
  showActions?: boolean
  onCopy?: () => void
  onRegenerate?: () => void
  onFeedback?: (type: 'positive' | 'negative') => void
}

// Chat input component props
export interface ChatInputProps extends BaseComponentProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (message: string) => void
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  maxLength?: number
  remainingMessages?: number
  error?: string
  onRetry?: () => void
  rateLimited?: boolean
  rateLimitReset?: Date
  validationRules?: {
    minLength?: number
    maxLength?: number
    required?: boolean
    pattern?: RegExp
    customValidator?: (value: string) => string | null
  }
}

// Typing indicator component props
export interface TypingIndicatorProps extends BaseComponentProps {
  visible: boolean
  variant?: 'dots' | 'pulse' | 'wave'
  message?: string
}

// Header component props
export interface HeaderProps extends BaseComponentProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  showBranding?: boolean
  remainingMessages?: number
  onReset?: () => void
}

// User preferences types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'sm' | 'md' | 'lg'
  messageGrouping: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  compactMode: boolean
  customBranding?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
  }
}

// Application state types
export interface AppState {
  messages: ChatMessage[]
  loading: boolean
  error?: string
  remainingMessages: number
  sessionId: string
  preferences: UserPreferences
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
}

// Theme configuration types
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

// Error types
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: React.ComponentType<{error: Error; retry: () => void}>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export interface ErrorMessageProps extends BaseComponentProps {
  type: 'network' | 'api' | 'validation' | 'generic'
  message?: string
  actions?: Array<{
    label: string
    action: () => void
    variant: 'primary' | 'secondary'
  }>
}

export interface ErrorRecoveryProps extends BaseComponentProps {
  error?: Error
  onRetry?: () => void
  onReset?: () => void
  showAdvanced?: boolean
}