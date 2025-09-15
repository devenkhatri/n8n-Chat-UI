import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ChatApp from '@/app/page';
import { ThemeProvider } from '@/providers/theme-provider';
import { AnalyticsProvider } from '@/providers/analytics-provider';

expect.extend(toHaveNoViolations);

// Mock server for API calls
const server = setupServer(
  rest.post('/api/chat', (req, res, ctx) => {
    return res(
      ctx.json({
        message: 'Hello! This is a test response from the assistant.',
        timestamp: new Date().toISOString(),
      })
    );
  })
);

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="light" enableSystem={false} storageKey="test-theme">
    <AnalyticsProvider enabled={false}>
      {children}
    </AnalyticsProvider>
  </ThemeProvider>
);

describe('Chat Functionality Integration Tests', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Basic Chat Flow', () => {
    it('should render the chat interface correctly', async () => {
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      // Check for main elements
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
      
      // Check for header
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should send a message and receive a response', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      const sendButton = screen.getByRole('button', { name: /send/i });

      // Type a message
      await user.type(messageInput, 'Hello, how are you?');
      expect(messageInput).toHaveValue('Hello, how are you?');

      // Send the message
      await user.click(sendButton);

      // Check that user message appears
      await waitFor(() => {
        expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      });

      // Check that assistant response appears
      await waitFor(() => {
        expect(screen.getByText(/Hello! This is a test response/)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Check that input is cleared
      expect(messageInput).toHaveValue('');
    });

    it('should show typing indicator while waiting for response', async () => {
      const user = userEvent.setup();
      
      // Delay the server response
      server.use(
        rest.post('/api/chat', (req, res, ctx) => {
          return res(
            ctx.delay(1000),
            ctx.json({
              message: 'Delayed response',
              timestamp: new Date().toISOString(),
            })
          );
        })
      );

      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      const sendButton = screen.getByRole('button', { name: /send/i });

      await user.type(messageInput, 'Test message');
      await user.click(sendButton);

      // Check for typing indicator
      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
      });

      // Wait for response and check typing indicator disappears
      await waitFor(() => {
        expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle keyboard shortcuts', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const messageInput = screen.getByRole('textbox', { name: /message/i });

      // Type a message
      await user.type(messageInput, 'Test message');

      // Send with Enter key
      await user.keyboard('{Enter}');

      // Check that message was sent
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should prevent sending empty messages', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const sendButton = screen.getByRole('button', { name: /send/i });

      // Try to send empty message
      await user.click(sendButton);

      // Check that no message was sent
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });
  });

  describe('Message Actions', () => {
    it('should allow copying messages', async () => {
      const user = userEvent.setup();
      
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      await user.type(messageInput, 'Test message');
      await user.keyboard('{Enter}');

      // Wait for response
      await waitFor(() => {
        expect(screen.getByText(/Hello! This is a test response/)).toBeInTheDocument();
      });

      // Find and click copy button for assistant message
      const assistantMessage = screen.getByText(/Hello! This is a test response/).closest('[role="article"]');
      const copyButton = within(assistantMessage!).getByRole('button', { name: /copy/i });
      
      await user.click(copyButton);

      // Check that clipboard was called
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Hello! This is a test response')
      );
    });

    it('should allow regenerating responses', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      await user.type(messageInput, 'Test message');
      await user.keyboard('{Enter}');

      // Wait for response
      await waitFor(() => {
        expect(screen.getByText(/Hello! This is a test response/)).toBeInTheDocument();
      });

      // Find and click regenerate button
      const assistantMessage = screen.getByText(/Hello! This is a test response/).closest('[role="article"]');
      const regenerateButton = within(assistantMessage!).getByRole('button', { name: /regenerate/i });
      
      await user.click(regenerateButton);

      // Check that typing indicator appears
      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      server.use(
        rest.post('/api/chat', (req, res, ctx) => {
          return res.networkError('Network error');
        })
      );

      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      await user.type(messageInput, 'Test message');
      await user.keyboard('{Enter}');

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Check for retry button
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      server.use(
        rest.post('/api/chat', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'Internal server error' })
          );
        })
      );

      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      await user.type(messageInput, 'Test message');
      await user.keyboard('{Enter}');

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Theme Switching', () => {
    it('should switch between light and dark themes', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      // Find theme toggle button
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      
      // Check initial theme (light)
      expect(document.documentElement).not.toHaveClass('dark');

      // Switch to dark theme
      await user.click(themeToggle);
      
      // Check that dark theme is applied
      await waitFor(() => {
        expect(document.documentElement).toHaveClass('dark');
      });
    });
  });

  describe('Conversation Management', () => {
    it('should clear conversation history', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      // Send a message first
      const messageInput = screen.getByRole('textbox', { name: /message/i });
      await user.type(messageInput, 'Test message');
      await user.keyboard('{Enter}');

      // Wait for response
      await waitFor(() => {
        expect(screen.getByText(/Hello! This is a test response/)).toBeInTheDocument();
      });

      // Find and click clear button
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      // Check that messages are cleared
      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
        expect(screen.queryByText(/Hello! This is a test response/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button', { name: /toggle theme/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('textbox', { name: /message/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /send/i })).toHaveFocus();
    });

    it('should announce message updates to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const messageInput = screen.getByRole('textbox', { name: /message/i });
      await user.type(messageInput, 'Test message');
      await user.keyboard('{Enter}');

      // Check for live region that announces new messages
      await waitFor(() => {
        const liveRegion = screen.getByRole('log');
        expect(liveRegion).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      // Check that mobile-specific classes or behaviors are applied
      const main = screen.getByRole('main');
      expect(main).toHaveClass(/mobile/);
    });
  });

  describe('Performance', () => {
    it('should handle large number of messages efficiently', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ChatApp />
        </TestWrapper>
      );

      const messageInput = screen.getByRole('textbox', { name: /message/i });

      // Send multiple messages quickly
      for (let i = 0; i < 10; i++) {
        await user.clear(messageInput);
        await user.type(messageInput, `Message ${i + 1}`);
        await user.keyboard('{Enter}');
      }

      // Check that all messages are rendered
      await waitFor(() => {
        for (let i = 0; i < 10; i++) {
          expect(screen.getByText(`Message ${i + 1}`)).toBeInTheDocument();
        }
      }, { timeout: 10000 });
    });
  });
});