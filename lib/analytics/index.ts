/**
 * Analytics and tracking system for user interactions and performance monitoring
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  messageResponseTime?: number;
  componentRenderTime?: number;
  bundleSize?: number;
}

export interface UsageMetrics {
  messagesPerSession: number;
  sessionDuration: number;
  errorRate: number;
  featureUsage: Record<string, number>;
  userRetention: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  userId?: string;
  sessionId: string;
  environment: 'development' | 'staging' | 'production';
  sampleRate: number; // 0-1, percentage of events to track
}

export class Analytics {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private performanceObserver?: PerformanceObserver;
  private sessionStartTime: number;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionStartTime = Date.now();
    
    if (config.enabled) {
      this.initializePerformanceMonitoring();
      this.setupUnloadHandler();
    }
  }

  /**
   * Track a user interaction or custom event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
      userId: this.config.userId,
      sessionId: this.config.sessionId,
    };

    this.eventQueue.push(event);
    this.flushEvents();
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: PerformanceMetrics): void {
    if (!this.config.enabled) return;

    this.track('performance_metrics', {
      ...metrics,
      sessionDuration: Date.now() - this.sessionStartTime,
    });
  }

  /**
   * Track page view
   */
  trackPageView(page?: string): void {
    this.track('page_view', {
      page: page || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    });
  }

  /**
   * Track user interaction with specific UI elements
   */
  trackInteraction(element: string, action: string, properties?: Record<string, any>): void {
    this.track('user_interaction', {
      element,
      action,
      ...properties,
    });
  }

  /**
   * Track errors and exceptions
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }

  /**
   * Initialize Core Web Vitals and performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track custom performance metrics
    this.trackCustomMetrics();
  }

  private trackCoreWebVitals(): void {
    // LCP - Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.trackPerformance({ lcp: lastEntry.startTime });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID - First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.trackPerformance({ fid: entry.processingStart - entry.startTime });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.trackPerformance({ cls: clsValue });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // FCP - First Contentful Paint
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.trackPerformance({ fcp: fcpEntry.startTime });
      }
    }

    // TTFB - Time to First Byte
    if ('performance' in window && 'timing' in performance) {
      const timing = (performance as any).timing;
      const ttfb = timing.responseStart - timing.navigationStart;
      this.trackPerformance({ ttfb });
    }
  }

  private trackCustomMetrics(): void {
    // Track bundle size
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resourceEntries.filter(entry => 
        entry.name.includes('.js') && entry.name.includes('/_next/')
      );
      
      const totalBundleSize = jsResources.reduce((total, entry) => 
        total + (entry.transferSize || 0), 0
      );
      
      if (totalBundleSize > 0) {
        this.trackPerformance({ bundleSize: totalBundleSize });
      }
    }
  }

  private setupUnloadHandler(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeunload', () => {
      this.flushEvents(true);
    });

    // Also flush periodically
    setInterval(() => {
      this.flushEvents();
    }, 30000); // Every 30 seconds
  }

  private async flushEvents(force = false): Promise<void> {
    if (this.eventQueue.length === 0) return;
    if (!force && this.eventQueue.length < 10) return; // Batch events

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (!this.config.endpoint) {
      // Log to console in development
      if (this.config.environment === 'development') {
        console.log('Analytics Events:', events);
      }
      return;
    }

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({ events }),
        keepalive: force, // Ensure events are sent even during page unload
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current session metrics
   */
  getSessionMetrics(): UsageMetrics {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    return {
      messagesPerSession: this.getEventCount('message_sent'),
      sessionDuration,
      errorRate: this.getEventCount('error') / Math.max(this.getEventCount('user_interaction'), 1),
      featureUsage: this.getFeatureUsage(),
      userRetention: sessionDuration > 300000 ? 1 : 0, // 5+ minutes = retained
    };
  }

  private getEventCount(eventName: string): number {
    return this.eventQueue.filter(event => event.name === eventName).length;
  }

  private getFeatureUsage(): Record<string, number> {
    const usage: Record<string, number> = {};
    
    this.eventQueue
      .filter(event => event.name === 'user_interaction')
      .forEach(event => {
        const element = event.properties?.element;
        if (element) {
          usage[element] = (usage[element] || 0) + 1;
        }
      });
    
    return usage;
  }
}

// Singleton instance
let analyticsInstance: Analytics | null = null;

export function initializeAnalytics(config: AnalyticsConfig): Analytics {
  analyticsInstance = new Analytics(config);
  return analyticsInstance;
}

export function getAnalytics(): Analytics | null {
  return analyticsInstance;
}

// Convenience functions
export function track(eventName: string, properties?: Record<string, any>): void {
  analyticsInstance?.track(eventName, properties);
}

export function trackInteraction(element: string, action: string, properties?: Record<string, any>): void {
  analyticsInstance?.trackInteraction(element, action, properties);
}

export function trackError(error: Error, context?: Record<string, any>): void {
  analyticsInstance?.trackError(error, context);
}

export function trackPerformance(metrics: PerformanceMetrics): void {
  analyticsInstance?.trackPerformance(metrics);
}