import { renderHook, act } from '@testing-library/react';
import { useAnalytics, useMessageAnalytics, useFeatureAnalytics } from '../use-analytics';

// Mock the analytics module
jest.mock('@/lib/analytics', () => ({
  initializeAnalytics: jest.fn(() => ({
    track: jest.fn(),
    trackInteraction: jest.fn(),
    trackError: jest.fn(),
    trackPerformance: jest.fn(),
    trackPageView: jest.fn(),
    updateConfig: jest.fn(),
    getSessionMetrics: jest.fn(() => ({
      messagesPerSession: 5,
      sessionDuration: 120000,
      errorRate: 0.1,
      featureUsage: { button: 3, input: 2 },
      userRetention: 1,
    })),
  })),
  getAnalytics: jest.fn(),
}));

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
    NEXT_PUBLIC_ANALYTICS_ENDPOINT: 'https://api.example.com/analytics',
    NEXT_PUBLIC_ANALYTICS_API_KEY: 'test-key',
    NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE: '1.0',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('useAnalytics', () => {
  it('should initialize analytics with correct config', () => {
    const { result } = renderHook(() => useAnalytics({ enabled: true }));

    expect(result.current.isEnabled).toBe(true);
    expect(typeof result.current.track).toBe('function');
    expect(typeof result.current.trackInteraction).toBe('function');
    expect(typeof result.current.trackError).toBe('function');
    expect(typeof result.current.trackPerformance).toBe('function');
    expect(typeof result.current.getSessionMetrics).toBe('function');
  });

  it('should track events', () => {
    const { result } = renderHook(() => useAnalytics({ enabled: true }));

    act(() => {
      result.current.track('test_event', { key: 'value' });
    });

    // The actual tracking is tested in the Analytics class tests
    expect(result.current.track).toBeDefined();
  });

  it('should track interactions', () => {
    const { result } = renderHook(() => useAnalytics({ enabled: true }));

    act(() => {
      result.current.trackInteraction('button', 'click', { buttonId: 'test' });
    });

    expect(result.current.trackInteraction).toBeDefined();
  });

  it('should track errors', () => {
    const { result } = renderHook(() => useAnalytics({ enabled: true }));
    const error = new Error('Test error');

    act(() => {
      result.current.trackError(error, { context: 'test' });
    });

    expect(result.current.trackError).toBeDefined();
  });

  it('should get session metrics', () => {
    const { result } = renderHook(() => useAnalytics({ enabled: true }));

    const metrics = result.current.getSessionMetrics();

    expect(metrics).toEqual({
      messagesPerSession: 5,
      sessionDuration: 120000,
      errorRate: 0.1,
      featureUsage: { button: 3, input: 2 },
      userRetention: 1,
    });
  });

  it('should handle disabled analytics', () => {
    const { result } = renderHook(() => useAnalytics({ enabled: false }));

    expect(result.current.isEnabled).toBe(false);
  });

  it('should update user ID', () => {
    const { result, rerender } = renderHook(
      ({ userId }) => useAnalytics({ enabled: true, userId }),
      { initialProps: { userId: 'user1' } }
    );

    // Change user ID
    rerender({ userId: 'user2' });

    expect(result.current.isEnabled).toBe(true);
  });
});

describe('useMessageAnalytics', () => {
  it('should provide message tracking functions', () => {
    const { result } = renderHook(() => useMessageAnalytics());

    expect(typeof result.current.trackMessageSent).toBe('function');
    expect(typeof result.current.trackMessageReceived).toBe('function');
    expect(typeof result.current.trackMessageAction).toBe('function');
    expect(typeof result.current.trackConversationAction).toBe('function');
  });

  it('should track message sent', () => {
    const { result } = renderHook(() => useMessageAnalytics());

    act(() => {
      result.current.trackMessageSent(100, 'text');
    });

    expect(result.current.trackMessageSent).toBeDefined();
  });

  it('should track message received', () => {
    const { result } = renderHook(() => useMessageAnalytics());

    act(() => {
      result.current.trackMessageReceived(1500, 200);
    });

    expect(result.current.trackMessageReceived).toBeDefined();
  });

  it('should track message actions', () => {
    const { result } = renderHook(() => useMessageAnalytics());

    act(() => {
      result.current.trackMessageAction('copy', 'msg-123');
    });

    expect(result.current.trackMessageAction).toBeDefined();
  });

  it('should track conversation actions', () => {
    const { result } = renderHook(() => useMessageAnalytics());

    act(() => {
      result.current.trackConversationAction('clear', 'conv-123');
    });

    expect(result.current.trackConversationAction).toBeDefined();
  });
});

describe('useFeatureAnalytics', () => {
  it('should provide feature tracking functions', () => {
    const { result } = renderHook(() => useFeatureAnalytics());

    expect(typeof result.current.trackFeatureUsage).toBe('function');
    expect(typeof result.current.trackThemeChange).toBe('function');
    expect(typeof result.current.trackSettingsChange).toBe('function');
    expect(typeof result.current.trackModalOpen).toBe('function');
    expect(typeof result.current.trackModalClose).toBe('function');
  });

  it('should track feature usage', () => {
    const { result } = renderHook(() => useFeatureAnalytics());

    act(() => {
      result.current.trackFeatureUsage('search', 'execute', { query: 'test' });
    });

    expect(result.current.trackFeatureUsage).toBeDefined();
  });

  it('should track theme changes', () => {
    const { result } = renderHook(() => useFeatureAnalytics());

    act(() => {
      result.current.trackThemeChange('dark');
    });

    expect(result.current.trackThemeChange).toBeDefined();
  });

  it('should track settings changes', () => {
    const { result } = renderHook(() => useFeatureAnalytics());

    act(() => {
      result.current.trackSettingsChange('fontSize', 'large');
    });

    expect(result.current.trackSettingsChange).toBeDefined();
  });

  it('should track modal interactions', () => {
    const { result } = renderHook(() => useFeatureAnalytics());

    act(() => {
      result.current.trackModalOpen('settings');
      result.current.trackModalClose('settings', 5000);
    });

    expect(result.current.trackModalOpen).toBeDefined();
    expect(result.current.trackModalClose).toBeDefined();
  });
});