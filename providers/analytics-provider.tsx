'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAnalytics, useMessageAnalytics, useFeatureAnalytics } from '@/hooks/use-analytics';

interface AnalyticsContextValue {
  track: (eventName: string, properties?: Record<string, any>) => void;
  trackInteraction: (element: string, action: string, properties?: Record<string, any>) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  trackMessageSent: (messageLength: number, messageType?: 'text' | 'command') => void;
  trackMessageReceived: (responseTime: number, messageLength: number) => void;
  trackMessageAction: (action: 'copy' | 'regenerate' | 'feedback', messageId: string) => void;
  trackConversationAction: (action: 'clear' | 'export' | 'import' | 'new', conversationId?: string) => void;
  trackFeatureUsage: (feature: string, action: string, properties?: Record<string, any>) => void;
  trackThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  trackSettingsChange: (setting: string, value: any) => void;
  trackModalOpen: (modalType: string) => void;
  trackModalClose: (modalType: string, duration: number) => void;
  isEnabled: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  userId?: string;
  enabled?: boolean;
}

export function AnalyticsProvider({ 
  children, 
  userId,
  enabled = process.env.NODE_ENV === 'production' 
}: AnalyticsProviderProps) {
  const analytics = useAnalytics({ 
    enabled, 
    userId,
    trackPageViews: true,
    trackPerformance: true,
  });

  const messageAnalytics = useMessageAnalytics();
  const featureAnalytics = useFeatureAnalytics();

  // Track app initialization
  useEffect(() => {
    if (analytics.isEnabled) {
      analytics.track('app_initialized', {
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        viewport: typeof window !== 'undefined' ? {
          width: window.innerWidth,
          height: window.innerHeight,
        } : undefined,
      });
    }
  }, [analytics]);

  // Track unhandled errors
  useEffect(() => {
    if (!analytics.isEnabled) return;

    const handleError = (event: ErrorEvent) => {
      analytics.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript_error',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          type: 'unhandled_promise_rejection',
        }
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [analytics]);

  // Track visibility changes
  useEffect(() => {
    if (!analytics.isEnabled) return;

    const handleVisibilityChange = () => {
      analytics.track('page_visibility_change', {
        visible: !document.hidden,
        timestamp: new Date().toISOString(),
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [analytics]);

  // Track page focus/blur
  useEffect(() => {
    if (!analytics.isEnabled) return;

    const handleFocus = () => {
      analytics.track('page_focus', {
        timestamp: new Date().toISOString(),
      });
    };

    const handleBlur = () => {
      analytics.track('page_blur', {
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [analytics]);

  const contextValue: AnalyticsContextValue = {
    track: analytics.track,
    trackInteraction: analytics.trackInteraction,
    trackError: analytics.trackError,
    trackMessageSent: messageAnalytics.trackMessageSent,
    trackMessageReceived: messageAnalytics.trackMessageReceived,
    trackMessageAction: messageAnalytics.trackMessageAction,
    trackConversationAction: messageAnalytics.trackConversationAction,
    trackFeatureUsage: featureAnalytics.trackFeatureUsage,
    trackThemeChange: featureAnalytics.trackThemeChange,
    trackSettingsChange: featureAnalytics.trackSettingsChange,
    trackModalOpen: featureAnalytics.trackModalOpen,
    trackModalClose: featureAnalytics.trackModalClose,
    isEnabled: analytics.isEnabled,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}

// Higher-order component for automatic interaction tracking
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function AnalyticsWrappedComponent(props: P) {
    const { trackInteraction } = useAnalyticsContext();

    const trackComponentInteraction = (action: string, properties?: Record<string, any>) => {
      trackInteraction(componentName, action, properties);
    };

    return (
      <Component 
        {...props} 
        trackInteraction={trackComponentInteraction}
      />
    );
  };
}

// Hook for component-level analytics
export function useComponentAnalytics(componentName: string) {
  const { trackInteraction, track } = useAnalyticsContext();

  const trackComponentInteraction = (action: string, properties?: Record<string, any>) => {
    trackInteraction(componentName, action, properties);
  };

  const trackComponentEvent = (eventName: string, properties?: Record<string, any>) => {
    track(`${componentName}_${eventName}`, properties);
  };

  return {
    trackComponentInteraction,
    trackComponentEvent,
  };
}