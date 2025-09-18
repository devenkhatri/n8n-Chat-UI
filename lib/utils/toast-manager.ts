import { type ToastProps } from '../../components/ui/toast'

interface ToastManagerConfig {
  maxToasts: number
  defaultDuration: number
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

interface ToastData extends Omit<ToastProps, 'visible' | 'onClose'> {
  id: string
  timestamp: number
}

type ToastListener = (toasts: ToastData[]) => void

class ToastManager {
  private toasts: ToastData[] = []
  private listeners: Set<ToastListener> = new Set()
  private config: ToastManagerConfig = {
    maxToasts: 5,
    defaultDuration: 5000,
    position: 'top-right'
  }

  constructor(config?: Partial<ToastManagerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener)
    listener([...this.toasts]) // Immediately call with current state
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  public add(toast: Omit<ToastData, 'id' | 'timestamp'>): string {
    const id = this.generateId()
    const newToast: ToastData = {
      ...toast,
      id,
      timestamp: Date.now(),
      duration: toast.duration ?? this.config.defaultDuration,
    }

    this.toasts = [newToast, ...this.toasts.slice(0, this.config.maxToasts - 1)]
    this.notifyListeners()

    // Auto-remove non-persistent toasts
    if (!toast.persistent && (toast.duration ?? this.config.defaultDuration) > 0) {
      setTimeout(() => {
        this.remove(id)
      }, toast.duration ?? this.config.defaultDuration)
    }

    return id
  }

  public remove(id: string): void {
    const index = this.toasts.findIndex(toast => toast.id === id)
    if (index !== -1) {
      this.toasts.splice(index, 1)
      this.notifyListeners()
    }
  }

  public clear(): void {
    this.toasts = []
    this.notifyListeners()
  }

  public update(id: string, updates: Partial<ToastData>): void {
    const index = this.toasts.findIndex(toast => toast.id === id)
    if (index !== -1) {
      this.toasts[index] = { ...this.toasts[index], ...updates }
      this.notifyListeners()
    }
  }

  public getToasts(): ToastData[] {
    return [...this.toasts]
  }

  public getToast(id: string): ToastData | undefined {
    return this.toasts.find(toast => toast.id === id)
  }

  // Convenience methods for different toast types
  public success(title: string, description?: string, options?: Partial<ToastData>): string {
    return this.add({
      type: 'success',
      title,
      description,
      ...options,
    })
  }

  public error(title: string, description?: string, options?: Partial<ToastData>): string {
    return this.add({
      type: 'error',
      title,
      description,
      persistent: true, // Errors should be persistent by default
      ...options,
    })
  }

  public warning(title: string, description?: string, options?: Partial<ToastData>): string {
    return this.add({
      type: 'warning',
      title,
      description,
      ...options,
    })
  }

  public info(title: string, description?: string, options?: Partial<ToastData>): string {
    return this.add({
      type: 'info',
      title,
      description,
      ...options,
    })
  }

  // Network-specific toast methods
  public networkError(error?: Error): string {
    return this.error(
      'Connection Problem',
      error?.message || 'Unable to connect to the server. Please check your internet connection.',
      {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }
    )
  }

  public serverError(error?: Error): string {
    return this.error(
      'Server Error',
      error?.message || 'The server is temporarily unavailable. Please try again later.',
      {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }
    )
  }

  public rateLimitError(resetTime?: Date): string {
    const resetText = resetTime 
      ? ` Try again after ${resetTime.toLocaleTimeString()}.`
      : ' Please wait before trying again.'
    
    return this.warning(
      'Rate Limited',
      `You've reached the request limit.${resetText}`
    )
  }

  public offlineNotification(): string {
    return this.warning(
      'You\'re Offline',
      'Your messages will be sent when connection is restored.',
      {
        persistent: true,
        action: {
          label: 'Dismiss',
          onClick: () => {} // Will be handled by the toast close
        }
      }
    )
  }

  public backOnlineNotification(): string {
    return this.success(
      'Back Online',
      'Connection restored. Queued messages are being sent.',
      {
        duration: 3000
      }
    )
  }
}

// Create singleton instance
export const toastManager = new ToastManager()

// Export convenience functions
export const toast = {
  success: (title: string, description?: string, options?: Partial<ToastData>) => 
    toastManager.success(title, description, options),
  error: (title: string, description?: string, options?: Partial<ToastData>) => 
    toastManager.error(title, description, options),
  warning: (title: string, description?: string, options?: Partial<ToastData>) => 
    toastManager.warning(title, description, options),
  info: (title: string, description?: string, options?: Partial<ToastData>) => 
    toastManager.info(title, description, options),
  remove: (id: string) => toastManager.remove(id),
  clear: () => toastManager.clear(),
}

// Network-specific toast utilities
export const networkToast = {
  error: (error?: Error) => toastManager.networkError(error),
  serverError: (error?: Error) => toastManager.serverError(error),
  rateLimit: (resetTime?: Date) => toastManager.rateLimitError(resetTime),
  offline: () => toastManager.offlineNotification(),
  backOnline: () => toastManager.backOnlineNotification(),
}