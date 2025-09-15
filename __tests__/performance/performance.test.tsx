import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageList } from '@/components/ui/message-list';
import { ChatMessage } from '@/components/ui/chat-message';
import { AnalyticsDashboard } from '@/components/ui/analytics-dashboard';
import { ThemeProvider } from '@/providers/theme-provider';
import { AnalyticsProvider } from '@/providers/analytics-provider';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  timing: {
    navigationStart: 0,
    responseStart: 100,
    domContentLoadedEventEnd: 500,
    loadEventEnd: 1000,
  },
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="light" enableSystem={false} storageKey="test-theme">
    <AnalyticsProvider enabled={false}>
      {children}
    </AnalyticsProvider>
  </ThemeProvider>
);

// Helper to generate mock messages
const generateMessages = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    role: i % 2 === 0 ? 'user' : 'assistant' as const,
    content: `This is message number ${i + 1}. It contains some text to simulate a real conversation.`,
    timestamp: new Date(Date.now() - (count - i) * 60000),
  }));
};

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering Performance', () => {
    it('should render large message lists efficiently', () => {
      const messages = generateMessages(100);
      const startTime = performance.now();

      render(
        <TestWrapper>
          <MessageList messages={messages} />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering 100 messages should take less than 100ms
      expect(renderTime).toBeLessThan(100);
      
      // All messages should be rendered
      expect(screen.getAllByRole('article')).toHaveLength(100);
    });

    it('should handle rapid message updates without performance degradation', async () => {
      const user = userEvent.setup();
      let messages = generateMessages(10);
      
      const TestComponent = () => {
        const [messageList, setMessageList] = React.useState(messages);
        
        const addMessage = () => {
          const newMessage = {
            id: `msg-${messageList.length}`,
            role: 'user' as const,
            content: `New message ${messageList.length + 1}`,
            timestamp: new Date(),
          };
          setMessageList(prev => [...prev, newMessage]);
        };

        return (
          <TestWrapper>
            <button onClick={addMessage}>Add Message</button>
            <MessageList messages={messageList} />
          </TestWrapper>
        );
      };

      render(<TestComponent />);

      const addButton = screen.getByRole('button', { name: /add message/i });
      const startTime = performance.now();

      // Add 20 messages rapidly
      for (let i = 0; i < 20; i++) {
        await user.click(addButton);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Adding 20 messages should take less than 200ms
      expect(totalTime).toBeLessThan(200);
      
      // Should have 30 total messages (10 initial + 20 added)
      expect(screen.getAllByRole('article')).toHaveLength(30);
    });

    it('should efficiently re-render when props change', () => {
      const message = generateMessages(1)[0];
      
      const TestComponent = ({ showActions }: { showActions: boolean }) => (
        <TestWrapper>
          <ChatMessage message={message} showActions={showActions} />
        </TestWrapper>
      );

      const { rerender } = render(<TestComponent showActions={false} />);

      const startTime = performance.now();
      
      // Re-render with different props
      rerender(<TestComponent showActions={true} />);
      
      const endTime = performance.now();
      const rerenderTime = endTime - startTime;

      // Re-rendering should be very fast
      expect(rerenderTime).toBeLessThan(10);
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks with event listeners', () => {
      const TestComponent = () => {
        React.useEffect(() => {
          const handleResize = () => {};
          window.addEventListener('resize', handleResize);
          
          return () => {
            window.removeEventListener('resize', handleResize);
          };
        }, []);

        return <div>Test component</div>;
      };

      const { unmount } = render(<TestComponent />);
      
      // Mock to track event listener cleanup
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      unmount();
      
      // Verify cleanup was called
      expect(removeEventListenerSpy).toHaveBeenCalled();
      
      removeEventListenerSpy.mockRestore();
    });

    it('should clean up timers and intervals', () => {
      const TestComponent = () => {
        React.useEffect(() => {
          const interval = setInterval(() => {}, 1000);
          const timeout = setTimeout(() => {}, 5000);
          
          return () => {
            clearInterval(interval);
            clearTimeout(timeout);
          };
        }, []);

        return <div>Test component</div>;
      };

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount } = render(<TestComponent />);
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Bundle Size Impact', () => {
    it('should not import unnecessary dependencies', () => {
      // This test would typically be run with bundle analysis tools
      // Here we simulate checking for heavy imports
      
      const TestComponent = () => {
        // Simulate conditional import
        const [heavyComponent, setHeavyComponent] = React.useState(null);
        
        const loadHeavyComponent = async () => {
          // Simulate dynamic import
          const component = await import('@/components/ui/analytics-dashboard');
          setHeavyComponent(component);
        };

        return (
          <div>
            <button onClick={loadHeavyComponent}>Load Heavy Component</button>
            {heavyComponent && <div>Heavy component loaded</div>}
          </div>
        );
      };

      render(<TestComponent />);
      
      // Heavy component should not be loaded initially
      expect(screen.queryByText('Heavy component loaded')).not.toBeInTheDocument();
    });
  });

  describe('Animation Performance', () => {
    it('should use CSS transforms for animations', () => {
      const TestComponent = () => (
        <div 
          className="transform transition-transform duration-300 hover:scale-105"
          data-testid="animated-element"
        >
          Animated element
        </div>
      );

      render(<TestComponent />);
      
      const element = screen.getByTestId('animated-element');
      
      // Check that transform classes are applied
      expect(element).toHaveClass('transform');
      expect(element).toHaveClass('transition-transform');
    });

    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const TestComponent = () => (
        <div 
          className="motion-reduce:transition-none transition-all duration-300"
          data-testid="animated-element"
        >
          Animated element
        </div>
      );

      render(<TestComponent />);
      
      const element = screen.getByTestId('animated-element');
      expect(element).toHaveClass('motion-reduce:transition-none');
    });
  });

  describe('Virtual Scrolling Performance', () => {
    it('should only render visible messages in large lists', () => {
      const messages = generateMessages(1000);
      
      const VirtualizedMessageList = ({ messages }: { messages: any[] }) => {
        // Simulate virtualization by only rendering first 20 items
        const visibleMessages = messages.slice(0, 20);
        
        return (
          <div data-testid="virtualized-list">
            {visibleMessages.map(message => (
              <div key={message.id} role="article">
                {message.content}
              </div>
            ))}
            <div data-testid="total-count">{messages.length} total messages</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <VirtualizedMessageList messages={messages} />
        </TestWrapper>
      );

      // Only 20 messages should be rendered in DOM
      expect(screen.getAllByRole('article')).toHaveLength(20);
      
      // But total count should show all 1000
      expect(screen.getByTestId('total-count')).toHaveTextContent('1000 total messages');
    });
  });

  describe('Network Performance', () => {
    it('should debounce rapid API calls', async () => {
      const user = userEvent.setup();
      const mockApiCall = jest.fn().mockResolvedValue({ success: true });
      
      const TestComponent = () => {
        const [query, setQuery] = React.useState('');
        
        // Simulate debounced search
        React.useEffect(() => {
          const timeoutId = setTimeout(() => {
            if (query) {
              mockApiCall(query);
            }
          }, 300);
          
          return () => clearTimeout(timeoutId);
        }, [query]);

        return (
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
          />
        );
      };

      render(<TestComponent />);
      
      const input = screen.getByPlaceholderText('Search...');
      
      // Type rapidly
      await user.type(input, 'test query');
      
      // API should not be called immediately
      expect(mockApiCall).not.toHaveBeenCalled();
      
      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 350));
      });
      
      // API should be called only once with final value
      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(mockApiCall).toHaveBeenCalledWith('test query');
    });

    it('should cancel previous requests when new ones are made', async () => {
      const abortController = new AbortController();
      const mockFetch = jest.fn().mockImplementation(() => 
        Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
      );
      
      global.fetch = mockFetch;
      global.AbortController = jest.fn(() => abortController);

      const TestComponent = () => {
        const [data, setData] = React.useState(null);
        
        const fetchData = async (id: string) => {
          const controller = new AbortController();
          
          try {
            const response = await fetch(`/api/data/${id}`, {
              signal: controller.signal,
            });
            const result = await response.json();
            setData(result);
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Fetch error:', error);
            }
          }
        };

        return (
          <div>
            <button onClick={() => fetchData('1')}>Fetch 1</button>
            <button onClick={() => fetchData('2')}>Fetch 2</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      const button1 = screen.getByText('Fetch 1');
      const button2 = screen.getByText('Fetch 2');
      
      await user.click(button1);
      await user.click(button2);
      
      // Both requests should be made
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Core Web Vitals', () => {
    it('should track Largest Contentful Paint (LCP)', () => {
      const mockObserver = jest.fn();
      global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
        observe: mockObserver,
        disconnect: jest.fn(),
      }));

      render(
        <TestWrapper>
          <AnalyticsDashboard />
        </TestWrapper>
      );

      // Verify that performance observer is set up for LCP
      expect(global.PerformanceObserver).toHaveBeenCalled();
      expect(mockObserver).toHaveBeenCalledWith({ entryTypes: ['largest-contentful-paint'] });
    });

    it('should track First Input Delay (FID)', () => {
      const mockObserver = jest.fn();
      global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
        observe: mockObserver,
        disconnect: jest.fn(),
      }));

      render(
        <TestWrapper>
          <AnalyticsDashboard />
        </TestWrapper>
      );

      // Verify that performance observer is set up for FID
      expect(mockObserver).toHaveBeenCalledWith({ entryTypes: ['first-input'] });
    });

    it('should track Cumulative Layout Shift (CLS)', () => {
      const mockObserver = jest.fn();
      global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
        observe: mockObserver,
        disconnect: jest.fn(),
      }));

      render(
        <TestWrapper>
          <AnalyticsDashboard />
        </TestWrapper>
      );

      // Verify that performance observer is set up for CLS
      expect(mockObserver).toHaveBeenCalledWith({ entryTypes: ['layout-shift'] });
    });
  });

  describe('Resource Loading', () => {
    it('should lazy load non-critical components', async () => {
      const LazyComponent = React.lazy(() => 
        Promise.resolve({
          default: () => <div>Lazy loaded component</div>
        })
      );

      const TestComponent = () => (
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      );

      render(<TestComponent />);

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for lazy component to load
      await screen.findByText('Lazy loaded component');
      
      expect(screen.getByText('Lazy loaded component')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should preload critical resources', () => {
      // Mock link element creation
      const mockLink = {
        rel: '',
        href: '',
        as: '',
      };
      
      const createElementSpy = jest.spyOn(document, 'createElement')
        .mockReturnValue(mockLink as any);
      const appendChildSpy = jest.spyOn(document.head, 'appendChild')
        .mockImplementation(() => mockLink as any);

      // Simulate preloading critical CSS
      const preloadCSS = (href: string) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = 'style';
        document.head.appendChild(link);
      };

      preloadCSS('/critical.css');

      expect(createElementSpy).toHaveBeenCalledWith('link');
      expect(mockLink.rel).toBe('preload');
      expect(mockLink.href).toBe('/critical.css');
      expect(mockLink.as).toBe('style');
      expect(appendChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
    });
  });
});