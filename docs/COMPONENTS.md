# Component Documentation

## Overview

This document provides detailed documentation for all UI components in the n8n Chat UI application. Each component includes usage examples, props documentation, and accessibility considerations.

## Base Components

### Button

A versatile button component with multiple variants and states.

#### Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

#### Usage Examples

```tsx
// Primary button
<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>

// Button with icon
<Button variant="secondary" icon={<PlusIcon />}>
  Add Item
</Button>

// Loading state
<Button variant="primary" loading>
  Saving...
</Button>

// Disabled state
<Button variant="danger" disabled>
  Delete
</Button>
```

#### Accessibility Features
- Proper ARIA attributes
- Keyboard navigation support
- Focus indicators
- Loading state announcements
- Disabled state handling

---

### Input

A flexible input component with validation and styling options.

#### Props

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  type?: string;
  className?: string;
}
```

#### Usage Examples

```tsx
// Basic input
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
/>

// Input with validation
<Input
  label="Password"
  type="password"
  value={password}
  onChange={setPassword}
  error={errors.password}
  required
/>

// Input with icons
<Input
  label="Search"
  placeholder="Search messages..."
  leftIcon={<SearchIcon />}
  rightIcon={<ClearIcon />}
/>
```

#### Accessibility Features
- Proper labeling
- Error announcements
- Required field indicators
- Keyboard navigation
- Screen reader support

---

### Card

A container component for grouping related content.

#### Props

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  role?: string;
  'aria-labelledby'?: string;
}
```

#### Usage Examples

```tsx
// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</Card>

// Elevated card with custom padding
<Card variant="elevated" padding="lg">
  <div>Enhanced card content</div>
</Card>

// Accessible card
<Card role="article" aria-labelledby="card-title">
  <h3 id="card-title">Article Title</h3>
  <p>Article content...</p>
</Card>
```

#### Accessibility Features
- Semantic HTML structure
- ARIA role support
- Proper heading hierarchy
- Focus management

---

## Chat Components

### ChatMessage

Displays individual chat messages with user/assistant differentiation.

#### Props

```typescript
interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    status?: 'sending' | 'sent' | 'error';
  };
  showActions?: boolean;
  onCopy?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  className?: string;
}
```

#### Usage Examples

```tsx
// Basic message
<ChatMessage message={message} />

// Message with actions
<ChatMessage
  message={message}
  showActions={true}
  onCopy={handleCopy}
  onRegenerate={handleRegenerate}
  onFeedback={handleFeedback}
/>
```

#### Accessibility Features
- Semantic article structure
- Role-based styling
- Action button labels
- Timestamp announcements
- Status indicators

---

### ChatInput

Input component specifically designed for chat interfaces.

#### Props

```typescript
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  maxLength?: number;
  remainingMessages?: number;
  className?: string;
}
```

#### Usage Examples

```tsx
// Basic chat input
<ChatInput
  value={input}
  onChange={setInput}
  onSubmit={handleSubmit}
  placeholder="Type your message..."
/>

// Chat input with limits
<ChatInput
  value={input}
  onChange={setInput}
  onSubmit={handleSubmit}
  maxLength={2000}
  remainingMessages={5}
  disabled={remainingMessages === 0}
/>
```

#### Accessibility Features
- Form structure
- Character count announcements
- Keyboard shortcuts
- Submit button labeling
- Disabled state handling

---

### TypingIndicator

Animated indicator showing when the assistant is typing.

#### Props

```typescript
interface TypingIndicatorProps {
  visible: boolean;
  variant?: 'dots' | 'pulse' | 'wave';
  message?: string;
  className?: string;
}
```

#### Usage Examples

```tsx
// Basic typing indicator
<TypingIndicator visible={isTyping} />

// Custom variant and message
<TypingIndicator
  visible={isTyping}
  variant="wave"
  message="AI is thinking..."
/>
```

#### Accessibility Features
- Screen reader announcements
- Reduced motion support
- Semantic structure
- Loading state indicators

---

## Layout Components

### Header

Application header with branding and navigation.

#### Props

```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBranding?: boolean;
  remainingMessages?: number;
  onReset?: () => void;
  className?: string;
}
```

#### Usage Examples

```tsx
// Basic header
<Header
  title="Chat Application"
  subtitle="AI Assistant"
/>

// Header with actions
<Header
  title="Chat Application"
  remainingMessages={5}
  onReset={handleReset}
  actions={<ThemeToggle />}
/>
```

#### Accessibility Features
- Landmark structure
- Heading hierarchy
- Navigation support
- Action button labels

---

### Layout

Flexible layout components for consistent spacing and structure.

#### Components

- `Layout.MainLayout`: Main application layout
- `Layout.ContentArea`: Content container
- `Layout.Container`: Responsive container
- `Layout.Stack`: Vertical spacing
- `Layout.Flex`: Flexbox utilities

#### Usage Examples

```tsx
// Main layout structure
<Layout.MainLayout>
  <Header title="App" />
  <Layout.ContentArea>
    <Layout.Container>
      <Layout.Stack spacing="lg">
        <Card>Content 1</Card>
        <Card>Content 2</Card>
      </Layout.Stack>
    </Layout.Container>
  </Layout.ContentArea>
</Layout.MainLayout>

// Flex layout
<Layout.Flex justify="between" align="center">
  <span>Left content</span>
  <Button>Right action</Button>
</Layout.Flex>
```

#### Accessibility Features
- Semantic HTML structure
- Responsive design
- Focus management
- Screen reader navigation

---

## Utility Components

### LoadingState

Displays loading states with various visual options.

#### Props

```typescript
interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'message-skeleton';
  message?: string;
  messageCount?: number;
  className?: string;
}
```

#### Usage Examples

```tsx
// Spinner loading
<LoadingState variant="spinner" message="Loading..." />

// Skeleton loading
<LoadingState variant="skeleton" />

// Message skeleton
<LoadingState
  variant="message-skeleton"
  messageCount={3}
/>
```

#### Accessibility Features
- Loading announcements
- Reduced motion support
- Semantic structure
- Progress indicators

---

### ErrorBoundary

Catches and displays JavaScript errors gracefully.

#### Props

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error: Error; retry: () => void}>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

#### Usage Examples

```tsx
// Basic error boundary
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary
  fallback={CustomErrorFallback}
  onError={logError}
>
  <MyComponent />
</ErrorBoundary>
```

#### Accessibility Features
- Error announcements
- Recovery actions
- Focus management
- Clear error messages

---

### Toast

Notification component for user feedback.

#### Props

```typescript
interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}
```

#### Usage Examples

```tsx
// Success toast
<Toast
  type="success"
  title="Success"
  message="Message sent successfully"
/>

// Error toast with action
<Toast
  type="error"
  title="Error"
  message="Failed to send message"
  actions={[
    { label: "Retry", action: handleRetry }
  ]}
/>
```

#### Accessibility Features
- ARIA live regions
- Role-based announcements
- Keyboard navigation
- Auto-dismiss options

---

## Accessibility Components

### SkipLinks

Navigation shortcuts for keyboard users.

#### Props

```typescript
interface SkipLinksProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}
```

#### Usage Examples

```tsx
// Default skip links
<SkipLinks />

// Custom skip links
<SkipLinks
  links={[
    { href: "#main", label: "Skip to main content" },
    { href: "#nav", label: "Skip to navigation" }
  ]}
/>
```

#### Accessibility Features
- Keyboard-only visibility
- Focus management
- Screen reader support
- Semantic navigation

---

### KeyboardNavigation

Provides arrow key navigation for lists and menus.

#### Props

```typescript
interface KeyboardNavigationProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
  onEscape?: () => void;
  trapFocus?: boolean;
  className?: string;
}
```

#### Usage Examples

```tsx
// Vertical navigation
<KeyboardNavigation orientation="vertical">
  <Button>Item 1</Button>
  <Button>Item 2</Button>
  <Button>Item 3</Button>
</KeyboardNavigation>

// Modal with focus trap
<KeyboardNavigation
  trapFocus
  onEscape={closeModal}
>
  <Modal>
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </Modal>
</KeyboardNavigation>
```

#### Accessibility Features
- Arrow key navigation
- Focus trapping
- Escape key handling
- ARIA attributes

---

## Performance Components

### LazyComponents

Dynamically imported components for better performance.

#### Available Components

```typescript
// Modal components
const LazySettingsModal = lazy(() => import('../settings-modal'));
const LazyConversationExportModal = lazy(() => import('../conversation-export-modal'));

// Dashboard components
const LazyAnalyticsDashboard = lazy(() => import('../analytics-dashboard'));
const LazyFeedbackAnalyticsPanel = lazy(() => import('../feedback-analytics-panel'));

// Panel components
const LazyConversationHistoryPanel = lazy(() => import('../conversation-history-panel'));
const LazySettingsPanel = lazy(() => import('../settings-panel'));
```

#### Usage Examples

```tsx
// Lazy modal
<Suspense fallback={<LoadingState />}>
  <LazySettingsModal
    isOpen={showSettings}
    onClose={() => setShowSettings(false)}
  />
</Suspense>

// Lazy dashboard
<Suspense fallback={<LoadingState variant="skeleton" />}>
  <LazyAnalyticsDashboard />
</Suspense>
```

#### Performance Features
- Code splitting
- Lazy loading
- Suspense boundaries
- Loading states

---

## Testing Guidelines

### Component Testing

Each component should include:

1. **Accessibility Tests**
   - axe-core violations
   - Keyboard navigation
   - Screen reader compatibility
   - Focus management

2. **Interaction Tests**
   - Click handlers
   - Form submissions
   - State changes
   - Error handling

3. **Visual Tests**
   - Variant rendering
   - Responsive behavior
   - Theme switching
   - Animation states

### Example Test Structure

```typescript
describe('Button Component', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Test</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    
    render(<Button onClick={onClick}>Test</Button>);
    
    await user.tab();
    await user.keyboard('{Enter}');
    
    expect(onClick).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    render(<Button loading>Test</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

## Maintenance

### Adding New Components

1. Create component file with TypeScript interfaces
2. Implement accessibility features
3. Add comprehensive tests
4. Update documentation
5. Add to component index
6. Create usage examples

### Updating Existing Components

1. Maintain backward compatibility
2. Update tests for new features
3. Document breaking changes
4. Update style guide
5. Test across all themes
6. Verify accessibility compliance

### Best Practices

- Use semantic HTML
- Implement proper TypeScript types
- Follow accessibility guidelines
- Write comprehensive tests
- Document component APIs
- Maintain consistent styling
- Optimize for performance