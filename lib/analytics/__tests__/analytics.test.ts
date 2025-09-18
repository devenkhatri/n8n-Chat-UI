import { Analytics, AnalyticsConfig, initializeAnalytics } from '../index';

// Mock fetch
global.fetch = jest.fn();

// Mock performance API
const mockPerformanceObserver = jest.fn();
global.PerformanceObserver = mockPerformanceObserver;

// Mock window and document
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
  },
  writable: true,
});

Object.defineProperty(document, 'readyState', {
  value: 'complete',
  writable: true,
});

describe('Analytics', () => {
  let analytics: Analytics;
  let config: AnalyticsConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    config = {
      enabled: true,
      endpoint: 'https://api.example.com/analytics',
      apiKey: 'test-api-key',
      sessionId: 'test-session-123',
      environment: 'development',
      sampleRate: 1.0,
    };

    analytics = new Analytics(config);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('initialization', () => {
    it('should initialize with correct config', () => {
      expect(analytics).toBeInstanceOf(Analytics);
    });

    it('should not initialize performance monitoring when disabled', () => {
      const disabledConfig = { ...config, enabled: false };
      new Analytics(disabledConfig);
      expect(mockPerformanceObserver).not.toHaveBeenCalled();
    });
  });

  describe('event tracking', () => {
    it('should track events with correct properties', () => {
      const eventName = 'test_event';
      const properties = { key: 'value' };

      analytics.track(eventName, properties);

      // Since events are queued, we need to trigger flush
      jest.advanceTimersByTime(10000);

      expect(fetch).toHaveBeenCalledWith(
        config.endpoint,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          }),
          body: expect.stringContaining(eventName),
        })
      );
    });

    it('should not track events when disabled', () => {
      const disabledAnalytics = new Analytics({ ...config, enabled: false });
      
      disabledAnalytics.track('test_event');
      
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should respect sample rate', () => {
      const lowSampleRateAnalytics = new Analytics({ ...config, sampleRate: 0 });
      
      lowSampleRateAnalytics.track('test_event');
      
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should track page views', () => {
      analytics.trackPageView('/test-page');

      expect(fetch).toHaveBeenCalledWith(
        config.endpoint,
        expect.objectContaining({
          body: expect.stringContaining('page_view'),
        })
      );
    });

    it('should track interactions', () => {
      analytics.trackInteraction('button', 'click', { buttonId: 'test-btn' });

      expect(fetch).toHaveBeenCalledWith(
        config.endpoint,
        expect.objectContaining({
          body: expect.stringContaining('user_interaction'),
        })
      );
    });

    it('should track errors', () => {
      const error = new Error('Test error');
      analytics.trackError(error, { context: 'test' });

      expect(fetch).toHaveBeenCalledWith(
        config.endpoint,
        expect.objectContaining({
          body: expect.stringContaining('error'),
        })
      );
    });
  });

  describe('performance tracking', () => {
    it('should track performance metrics', () => {
      const metrics = {
        lcp: 1200,
        fid: 50,
        cls: 0.1,
      };

      analytics.trackPerformance(metrics);

      expect(fetch).toHaveBeenCalledWith(
        config.endpoint,
        expect.objectContaining({
          body: expect.stringContaining('performance_metrics'),
        })
      );
    });
  });

  describe('session metrics', () => {
    it('should return session metrics', () => {
      // Track some events first
      analytics.track('message_sent');
      analytics.track('user_interaction', { element: 'button' });
      analytics.track('error');

      const metrics = analytics.getSessionMetrics();

      expect(metrics).toEqual(
        expect.objectContaining({
          messagesPerSession: expect.any(Number),
          sessionDuration: expect.any(Number),
          errorRate: expect.any(Number),
          featureUsage: expect.any(Object),
          userRetention: expect.any(Number),
        })
      );
    });
  });

  describe('configuration updates', () => {
    it('should update configuration', () => {
      const newUserId = 'new-user-123';
      analytics.updateConfig({ userId: newUserId });

      analytics.track('test_event');

      expect(fetch).toHaveBeenCalledWith(
        config.endpoint,
        expect.objectContaining({
          body: expect.stringContaining(newUserId),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      analytics.track('test_event');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send analytics events:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});

describe('Analytics singleton', () => {
  it('should initialize and return singleton instance', () => {
    const config: AnalyticsConfig = {
      enabled: true,
      sessionId: 'test-session',
      environment: 'development',
      sampleRate: 1.0,
    };

    const instance = initializeAnalytics(config);
    expect(instance).toBeInstanceOf(Analytics);
  });
});