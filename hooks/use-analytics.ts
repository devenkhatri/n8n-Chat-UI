import { useEffect, useCallback, useRef } from 'react';
import { 
  Analytics, 
  AnalyticsConfig, 
  initializeAnalytics, 
  getAnalytics,
  PerformanceMetrics,
  UsageMetrics 
} from '@/lib/analytics';

interface UseAnalyticsOptions {
  enabled?: boolean;
  userId?: string;
  trackPageViews?: boolean;
  trackPerformance?: boolean;
}

interface UseAnalyticsReturn {
  track: (eventName: string, properties?: Record<string, any>) => void;
  trackInteraction: (element: string, action: string, properties?: Record<string, any>) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  trackPerformance: (metrics: PerformanceMetrics) => void;
  getSessionMetrics: () => UsageMetrics | null;
  isEnabled: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    enabled = process.env.NODE_ENV === 'production',
    userId,
    trackPageViews = true,
    trackPerformance = true,
  } = options;

  const analyticsRef = useRef<Analytics | null>(null);
  const initializedRef = useRef(false);

  // Initialize analytics on mount
  useEffect(() => {
    if (initializedRef.current) return;

    const config: AnalyticsConfig = {
      enabled,
      endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY,
      userId,
      sessionId: generateSessionId(),
      environment: (process.env.NODE_ENV as any) || 'development',
      sampleRate: parseFloat(process.env.NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE || '1.0'),
    };

    analyticsRef.current = initializeAnalytics(config);
    initializedRef.current = true;

    // Track initial page view
    if (trackPageViews) {
      analyticsRef.current.trackPageView();
    }

    // Track initial performance metrics
    if (trackPerformance) {
      // Wait for page load to complete
      if (document.readyState === 'complete') {
        trackInitialPerformance();
      } else {
        window.addEventListener('load', trackInitialPerformance);
      }
    }

    return () => {
      if (trackPerformance) {
        window.removeEventListener('load', trackInitialPerformance);
      }
    };
  }, [enabled, userId, trackPageViews, trackPerformance]);

  const trackInitialPerformance = useCallback(() => {
    if (!analyticsRef.current) return;

    // Track page load performance
    if ('performance' in window && 'timing' in performance) {
      const timing = (performance as any).timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      
      analyticsRef.current.trackPerformance({
        fcp: domContentLoaded,
        ttfb: timing.responseStart - timing.navigationStart,
      });

      analyticsRef.current.track('page_load', {
        loadTime,
        domContentLoaded,
      });
    }
  }, []);

  // Update user ID when it changes
  useEffect(() => {
    if (analyticsRef.current && userId) {
      analyticsRef.current.updateConfig({ userId });
    }
  }, [userId]);

  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    analyticsRef.current?.track(eventName, properties);
  }, []);

  const trackInteraction = useCallback((element: string, action: string, properties?: Record<string, any>) => {
    analyticsRef.current?.trackInteraction(element, action, properties);
  }, []);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analyticsRef.current?.trackError(error, context);
  }, []);

  const trackPerformanceMetrics = useCallback((metrics: PerformanceMetrics) => {
    analyticsRef.current?.trackPerformance(metrics);
  }, []);

  const getSessionMetrics = useCallback((): UsageMetrics | null => {
    return analyticsRef.current?.getSessionMetrics() || null;
  }, []);

  return {
    track,
    trackInteraction,
    trackError,
    trackPerformance: trackPerformanceMetrics,
    getSessionMetrics,
    isEnabled: enabled,
  };
}

// Utility function to generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Hook for tracking component performance
export function useComponentPerformance(componentName: string) {
  const { trackPerformance } = useAnalytics();
  const renderStartRef = useRef<number>();

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      trackPerformance({
        componentRenderTime: renderTime,
      });
    }
  });

  const trackComponentInteraction = useCallback((action: string, properties?: Record<string, any>) => {
    const { trackInteraction } = useAnalytics();
    trackInteraction(componentName, action, properties);
  }, [componentName]);

  return { trackComponentInteraction };
}

// Hook for tracking message-specific analytics
export function useMessageAnalytics() {
  const { track, trackInteraction, trackPerformance } = useAnalytics();

  const trackMessageSent = useCallback((messageLength: number, messageType: 'text' | 'command' = 'text') => {
    track('message_sent', {
      messageLength,
      messageType,
      timestamp: new Date().toISOString(),
    });
  }, [track]);

  const trackMessageReceived = useCallback((responseTime: number, messageLength: number) => {
    track('message_received', {
      responseTime,
      messageLength,
      timestamp: new Date().toISOString(),
    });

    trackPerformance({
      messageResponseTime: responseTime,
    });
  }, [track, trackPerformance]);

  const trackMessageAction = useCallback((action: 'copy' | 'regenerate' | 'feedback', messageId: string) => {
    trackInteraction('message', action, {
      messageId,
      timestamp: new Date().toISOString(),
    });
  }, [trackInteraction]);

  const trackConversationAction = useCallback((action: 'clear' | 'export' | 'import' | 'new', conversationId?: string) => {
    trackInteraction('conversation', action, {
      conversationId,
      timestamp: new Date().toISOString(),
    });
  }, [trackInteraction]);

  return {
    trackMessageSent,
    trackMessageReceived,
    trackMessageAction,
    trackConversationAction,
  };
}

// Hook for tracking feature usage
export function useFeatureAnalytics() {
  const { trackInteraction } = useAnalytics();

  const trackFeatureUsage = useCallback((feature: string, action: string, properties?: Record<string, any>) => {
    trackInteraction(`feature_${feature}`, action, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }, [trackInteraction]);

  const trackThemeChange = useCallback((theme: 'light' | 'dark' | 'system') => {
    trackFeatureUsage('theme', 'change', { theme });
  }, [trackFeatureUsage]);

  const trackSettingsChange = useCallback((setting: string, value: any) => {
    trackFeatureUsage('settings', 'change', { setting, value });
  }, [trackFeatureUsage]);

  const trackModalOpen = useCallback((modalType: string) => {
    trackFeatureUsage('modal', 'open', { modalType });
  }, [trackFeatureUsage]);

  const trackModalClose = useCallback((modalType: string, duration: number) => {
    trackFeatureUsage('modal', 'close', { modalType, duration });
  }, [trackFeatureUsage]);

  return {
    trackFeatureUsage,
    trackThemeChange,
    trackSettingsChange,
    trackModalOpen,
    trackModalClose,
  };
}