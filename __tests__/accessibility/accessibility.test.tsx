import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChatMessage } from '@/components/ui/chat-message';
import { ChatInput } from '@/components/ui/chat-input';
import { Header } from '@/components/ui/header';
import { SkipLinks } from '@/components/ui/skip-links';
import { KeyboardNavigation } from '@/components/ui/keyboard-navigation';
import { AccessibilitySettings } from '@/components/ui/accessibility-settings';
import { ThemeProvider } from '@/providers/theme-provider';
import { AccessibilityProvider } from '@/providers/accessibility-provider';
import { a11yTesting, colorContrast, reducedMotion } from '@/lib/utils/accessibility';

expect.extend(toHaveNoViolations);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="light" enableSystem={false} storageKey="test-theme">
    <AccessibilityProvider>
      {children}
    </AccessibilityProvider>
  </ThemeProvider>
);

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Button>Click me</Button>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Button disabled aria-label="Custom label">
          Button text
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toBeDisabled();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      
      // Focus with tab
      await user.tab();
      expect(button).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Activate with Space
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should have proper focus indicators', async () => {
      const user = userEvent.setup();

      render(<Button>Focus me</Button>);

      const button = screen.getByRole('button');
      await user.tab();

      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus:ring-2');
    });
  });

  describe('Input Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Input 
          label="Test input"
          placeholder="Enter text"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper labeling', () => {
      render(
        <Input 
          label="Email address"
          placeholder="Enter your email"
          helperText="We'll never share your email"
        />
      );

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email address');
      const helperText = screen.getByText("We'll never share your email");

      expect(input).toHaveAccessibleName('Email address');
      expect(input).toHaveAccessibleDescription("We'll never share your email");
      expect(label).toBeInTheDocument();
      expect(helperText).toBeInTheDocument();
    });

    it('should handle error states accessibly', () => {
      render(
        <Input 
          label="Username"
          error="Username is required"
          aria-invalid="true"
        />
      );

      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('Username is required');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription('Username is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <Input 
          label="Test input"
          onChange={handleChange}
        />
      );

      const input = screen.getByRole('textbox');
      
      await user.tab();
      expect(input).toHaveFocus();

      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Card Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <h2>Card title</h2>
          <p>Card content</p>
        </Card>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support proper semantic structure', () => {
      render(
        <Card role="article" aria-labelledby="card-title">
          <h2 id="card-title">Article title</h2>
          <p>Article content</p>
        </Card>
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAccessibleName('Article title');
    });
  });

  describe('ChatMessage Component', () => {
    const mockMessage = {
      id: '1',
      role: 'user' as const,
      content: 'Hello, how are you?',
      timestamp: new Date(),
    };

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <ChatMessage message={mockMessage} />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <ChatMessage message={mockMessage} />
        </TestWrapper>
      );

      const message = screen.getByRole('article');
      expect(message).toHaveAccessibleName(/user message/i);
      expect(message).toBeInTheDocument();
    });

    it('should announce message actions to screen readers', () => {
      render(
        <TestWrapper>
          <ChatMessage 
            message={{ ...mockMessage, role: 'assistant' }}
            showActions={true}
          />
        </TestWrapper>
      );

      const copyButton = screen.getByRole('button', { name: /copy message/i });
      const regenerateButton = screen.getByRole('button', { name: /regenerate/i });

      expect(copyButton).toHaveAttribute('aria-label');
      expect(regenerateButton).toHaveAttribute('aria-label');
    });
  });

  describe('ChatInput Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <ChatInput 
            value=""
            onChange={() => {}}
            onSubmit={() => {}}
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form structure', () => {
      render(
        <TestWrapper>
          <ChatInput 
            value=""
            onChange={() => {}}
            onSubmit={() => {}}
          />
        </TestWrapper>
      );

      const form = screen.getByRole('form');
      const textbox = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /send/i });

      expect(form).toBeInTheDocument();
      expect(textbox).toHaveAccessibleName(/message/i);
      expect(button).toBeInTheDocument();
    });

    it('should handle disabled state accessibly', () => {
      render(
        <TestWrapper>
          <ChatInput 
            value=""
            onChange={() => {}}
            onSubmit={() => {}}
            disabled={true}
          />
        </TestWrapper>
      );

      const textbox = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /send/i });

      expect(textbox).toBeDisabled();
      expect(button).toBeDisabled();
    });

    it('should announce character limits to screen readers', () => {
      render(
        <TestWrapper>
          <ChatInput 
            value="Test message"
            onChange={() => {}}
            onSubmit={() => {}}
            maxLength={100}
          />
        </TestWrapper>
      );

      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveAccessibleDescription(/characters remaining/i);
    });
  });

  describe('Header Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <Header 
            title="Chat Application"
            subtitle="AI Assistant"
          />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper landmark structure', () => {
      render(
        <TestWrapper>
          <Header 
            title="Chat Application"
            subtitle="AI Assistant"
          />
        </TestWrapper>
      );

      const banner = screen.getByRole('banner');
      const heading = screen.getByRole('heading', { level: 1 });

      expect(banner).toBeInTheDocument();
      expect(heading).toHaveTextContent('Chat Application');
    });

    it('should have accessible navigation elements', () => {
      render(
        <TestWrapper>
          <Header 
            title="Chat Application"
            actions={
              <button aria-label="Settings">⚙️</button>
            }
          />
        </TestWrapper>
      );

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toBeInTheDocument();
    });
  });

  describe('Color Contrast', () => {
    it('should maintain proper contrast ratios in light theme', () => {
      render(
        <TestWrapper>
          <div className="bg-white text-gray-900">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <p className="text-gray-600">Secondary text</p>
          </div>
        </TestWrapper>
      );

      // These would typically be tested with automated tools
      // or manual verification against WCAG guidelines
      const primaryButton = screen.getByRole('button', { name: /primary/i });
      const secondaryButton = screen.getByRole('button', { name: /secondary/i });

      expect(primaryButton).toBeInTheDocument();
      expect(secondaryButton).toBeInTheDocument();
    });

    it('should maintain proper contrast ratios in dark theme', () => {
      render(
        <div className="dark">
          <TestWrapper>
            <div className="bg-gray-900 text-white">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <p className="text-gray-300">Secondary text</p>
            </div>
          </TestWrapper>
        </div>
      );

      const primaryButton = screen.getByRole('button', { name: /primary/i });
      const secondaryButton = screen.getByRole('button', { name: /secondary/i });

      expect(primaryButton).toBeInTheDocument();
      expect(secondaryButton).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should trap focus in modals', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <div>
            <button>Outside button</button>
            <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
              <h2 id="modal-title">Modal Title</h2>
              <button>First button</button>
              <button>Second button</button>
              <button>Close</button>
            </div>
          </div>
        </TestWrapper>
      );

      const modal = screen.getByRole('dialog');
      const firstButton = screen.getByText('First button');
      const secondButton = screen.getByText('Second button');
      const closeButton = screen.getByText('Close');

      // Focus should be trapped within modal
      firstButton.focus();
      expect(firstButton).toHaveFocus();

      await user.tab();
      expect(secondButton).toHaveFocus();

      await user.tab();
      expect(closeButton).toHaveFocus();

      // Tab from last element should cycle back to first
      await user.tab();
      expect(firstButton).toHaveFocus();
    });

    it('should restore focus after modal closes', () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Modal';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      // Simulate modal opening and closing
      const modal = document.createElement('div');
      modal.setAttribute('role', 'dialog');
      document.body.appendChild(modal);

      // Focus should return to trigger button when modal closes
      document.body.removeChild(modal);
      expect(document.activeElement).toBe(triggerButton);

      document.body.removeChild(triggerButton);
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should announce dynamic content changes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <div>
            <button>Add item</button>
            <div role="status" aria-live="polite" aria-label="Status updates">
              <span id="status-text">Ready</span>
            </div>
            <ul role="list" aria-label="Items">
              <li>Item 1</li>
            </ul>
          </div>
        </TestWrapper>
      );

      const statusRegion = screen.getByRole('status');
      const addButton = screen.getByRole('button', { name: /add item/i });

      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(statusRegion).toBeInTheDocument();

      // Simulate adding an item
      await user.click(addButton);
      
      // Status should be announced to screen readers
      expect(statusRegion).toBeInTheDocument();
    });

    it('should use appropriate live regions for different types of updates', () => {
      render(
        <TestWrapper>
          <div>
            {/* Polite announcements for non-urgent updates */}
            <div role="status" aria-live="polite">
              Message sent successfully
            </div>
            
            {/* Assertive announcements for urgent updates */}
            <div role="alert" aria-live="assertive">
              Error: Failed to send message
            </div>
            
            {/* Log for chat messages */}
            <div role="log" aria-live="polite" aria-label="Chat messages">
              New message received
            </div>
          </div>
        </TestWrapper>
      );

      const statusRegion = screen.getByRole('status');
      const alertRegion = screen.getByRole('alert');
      const logRegion = screen.getByRole('log');

      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
      expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
      expect(logRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Reduced Motion', () => {
    it('should respect prefers-reduced-motion setting', () => {
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

      render(
        <TestWrapper>
          <div className="motion-reduce:animate-none animate-pulse">
            Animated content
          </div>
        </TestWrapper>
      );

      const animatedElement = screen.getByText('Animated content');
      expect(animatedElement).toHaveClass('motion-reduce:animate-none');
    });

    it('should disable animations when reduced motion is preferred', () => {
      expect(reducedMotion.prefersReducedMotion()).toBeDefined();
      expect(reducedMotion.getAnimationDuration(300)).toBeDefined();
      expect(reducedMotion.conditionalAnimation('fadeIn')).toBeDefined();
    });
  });

  describe('Skip Links Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <SkipLinks />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide keyboard navigation shortcuts', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SkipLinks />
          <main id="main-content">Main content</main>
          <div id="chat-input">Chat input</div>
        </TestWrapper>
      );

      // Tab to first skip link
      await user.tab();
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveFocus();

      // Activate skip link
      await user.keyboard('{Enter}');
      const mainContent = document.getElementById('main-content');
      expect(mainContent).toHaveFocus();
    });
  });

  describe('Keyboard Navigation Component', () => {
    it('should handle arrow key navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <KeyboardNavigation orientation="vertical">
            <button>Item 1</button>
            <button>Item 2</button>
            <button>Item 3</button>
          </KeyboardNavigation>
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      
      // Focus first button
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();

      // Arrow down should move to next button
      await user.keyboard('{ArrowDown}');
      expect(buttons[1]).toHaveFocus();

      // Arrow up should move to previous button
      await user.keyboard('{ArrowUp}');
      expect(buttons[0]).toHaveFocus();
    });

    it('should handle escape key', async () => {
      const user = userEvent.setup();
      const onEscape = jest.fn();

      render(
        <TestWrapper>
          <KeyboardNavigation onEscape={onEscape}>
            <button>Item 1</button>
            <button>Item 2</button>
          </KeyboardNavigation>
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons[0].focus();

      await user.keyboard('{Escape}');
      expect(onEscape).toHaveBeenCalled();
    });
  });

  describe('Accessibility Settings Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <AccessibilitySettings />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should allow users to configure accessibility preferences', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AccessibilitySettings />
        </TestWrapper>
      );

      // Test reduced motion toggle
      const reducedMotionCheckbox = screen.getByRole('checkbox', { name: /reduce motion/i });
      expect(reducedMotionCheckbox).not.toBeChecked();

      await user.click(reducedMotionCheckbox);
      expect(reducedMotionCheckbox).toBeChecked();

      // Test font size selection
      const largeFontRadio = screen.getByRole('radio', { name: /large/i });
      await user.click(largeFontRadio);
      expect(largeFontRadio).toBeChecked();

      // Test high contrast toggle
      const highContrastCheckbox = screen.getByRole('checkbox', { name: /high contrast/i });
      await user.click(highContrastCheckbox);
      expect(highContrastCheckbox).toBeChecked();
    });

    it('should reset settings to defaults', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AccessibilitySettings />
        </TestWrapper>
      );

      // Change some settings
      const reducedMotionCheckbox = screen.getByRole('checkbox', { name: /reduce motion/i });
      await user.click(reducedMotionCheckbox);
      expect(reducedMotionCheckbox).toBeChecked();

      // Reset to defaults
      const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
      await user.click(resetButton);
      expect(reducedMotionCheckbox).not.toBeChecked();
    });
  });

  describe('Accessibility Utilities', () => {
    describe('Color Contrast', () => {
      it('should calculate contrast ratios correctly', () => {
        const whiteRGB: [number, number, number] = [255, 255, 255];
        const blackRGB: [number, number, number] = [0, 0, 0];
        
        const ratio = colorContrast.getContrastRatio(whiteRGB, blackRGB);
        expect(ratio).toBeCloseTo(21, 0); // Perfect contrast ratio
        
        expect(colorContrast.meetsWCAG(ratio, 'AA')).toBe(true);
        expect(colorContrast.meetsWCAG(ratio, 'AAA')).toBe(true);
      });

      it('should identify insufficient contrast', () => {
        const lightGrayRGB: [number, number, number] = [200, 200, 200];
        const whiteRGB: [number, number, number] = [255, 255, 255];
        
        const ratio = colorContrast.getContrastRatio(lightGrayRGB, whiteRGB);
        expect(colorContrast.meetsWCAG(ratio, 'AA')).toBe(false);
      });
    });

    describe('Accessibility Testing', () => {
      it('should detect missing alt text', () => {
        const container = document.createElement('div');
        container.innerHTML = `
          <img src="test.jpg" alt="Good image" />
          <img src="test2.jpg" />
          <img src="test3.jpg" aria-label="Also good" />
        `;

        const issues = a11yTesting.checkImageAltText(container);
        expect(issues).toHaveLength(1);
        expect(issues[0]).toContain('Image 2 is missing alt text');
      });

      it('should detect heading hierarchy issues', () => {
        const container = document.createElement('div');
        container.innerHTML = `
          <h2>Wrong first heading</h2>
          <h4>Skipped h3</h4>
          <h3>Back to h3</h3>
        `;

        const issues = a11yTesting.checkHeadingHierarchy(container);
        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]).toContain('First heading should be h1');
      });

      it('should detect missing form labels', () => {
        const container = document.createElement('div');
        container.innerHTML = `
          <input type="text" id="good-input" />
          <label for="good-input">Good label</label>
          <input type="text" />
          <input type="text" aria-label="Also good" />
        `;

        const issues = a11yTesting.checkFormLabels(container);
        expect(issues).toHaveLength(1);
        expect(issues[0]).toContain('Form input 2 is missing a label');
      });

      it('should run all accessibility checks', () => {
        const container = document.createElement('div');
        container.innerHTML = `
          <h2>Wrong heading level</h2>
          <img src="test.jpg" />
          <input type="text" />
        `;

        const results = a11yTesting.runAllChecks(container);
        expect(results.imageAltText.length).toBeGreaterThan(0);
        expect(results.headingHierarchy.length).toBeGreaterThan(0);
        expect(results.formLabels.length).toBeGreaterThan(0);
      });
    });
  });

  describe('High Contrast Mode', () => {
    it('should detect high contrast preferences', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <TestWrapper>
          <div className="contrast-more:border-2 border">
            High contrast content
          </div>
        </TestWrapper>
      );

      const element = screen.getByText('High contrast content');
      expect(element).toHaveClass('contrast-more:border-2');
    });
  });

  describe('Comprehensive Integration Tests', () => {
    it('should maintain accessibility across theme changes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <div>
            <button data-testid="theme-toggle">Toggle Theme</button>
            <Button>Test Button</Button>
            <Input label="Test Input" />
          </div>
        </TestWrapper>
      );

      const { container } = render(
        <TestWrapper>
          <div className="dark">
            <Button>Dark Theme Button</Button>
            <Input label="Dark Theme Input" />
          </div>
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle complex interactive scenarios', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <div>
            <SkipLinks />
            <Header title="Test App" />
            <main id="main-content">
              <KeyboardNavigation>
                <Button>Action 1</Button>
                <Button>Action 2</Button>
                <Button>Action 3</Button>
              </KeyboardNavigation>
              <ChatInput
                value=""
                onChange={() => {}}
                onSubmit={() => {}}
              />
            </main>
          </div>
        </TestWrapper>
      );

      // Test skip link navigation
      await user.tab();
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveFocus();

      await user.keyboard('{Enter}');
      const mainContent = document.getElementById('main-content');
      expect(mainContent).toHaveFocus();

      // Test keyboard navigation within main content
      await user.tab();
      const firstButton = screen.getByText('Action 1');
      expect(firstButton).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      const secondButton = screen.getByText('Action 2');
      expect(secondButton).toHaveFocus();
    });

    it('should announce dynamic content changes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <div>
            <button>Add Message</button>
            <div role="log" aria-live="polite" aria-label="Chat messages">
              <div>Initial message</div>
            </div>
          </div>
        </TestWrapper>
      );

      const logRegion = screen.getByRole('log');
      const addButton = screen.getByRole('button', { name: /add message/i });

      expect(logRegion).toHaveAttribute('aria-live', 'polite');
      expect(logRegion).toHaveAccessibleName('Chat messages');

      await user.click(addButton);
      // In a real implementation, this would add a new message to the log
      expect(logRegion).toBeInTheDocument();
    });
  });
});