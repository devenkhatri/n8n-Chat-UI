# UI/UX Style Guide

## Overview

This style guide documents the design system, components, and patterns used in the n8n Chat UI application. It serves as a reference for maintaining consistency across the application and for future development.

## Design Principles

### 1. Accessibility First
- All components meet WCAG 2.1 AA standards
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

### 2. Mobile-First Responsive Design
- Touch-friendly interactions (44px minimum touch targets)
- Responsive typography and spacing
- Optimized for various screen sizes
- Progressive enhancement

### 3. Performance Optimized
- Lazy loading for non-critical components
- Optimized bundle sizes
- Efficient animations
- Minimal layout shifts

### 4. Consistent Visual Language
- Cohesive color palette
- Consistent spacing system
- Unified typography scale
- Predictable interaction patterns

## Color System

### Primary Colors
```css
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6;  /* Main brand color */
--color-primary-900: #1e3a8a;
```

### Semantic Colors
```css
--color-success-500: #10b981;  /* Success states */
--color-warning-500: #f59e0b;  /* Warning states */
--color-error-500: #ef4444;    /* Error states */
--color-info-500: #06b6d4;     /* Information */
```

### Neutral Colors
```css
--color-gray-50: #f9fafb;      /* Lightest gray */
--color-gray-500: #6b7280;     /* Medium gray */
--color-gray-900: #111827;     /* Darkest gray */
```

### Usage Guidelines
- Use primary colors for main actions and branding
- Use semantic colors consistently for their intended purpose
- Maintain 4.5:1 contrast ratio minimum for text
- Test colors in both light and dark themes

## Typography

### Font Families
- **Sans-serif**: Inter (primary)
- **Monospace**: JetBrains Mono (code)

### Type Scale
```css
--text-xs: 0.75rem;    /* 12px - Small labels */
--text-sm: 0.875rem;   /* 14px - Body text small */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body text */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Medium headings */
--text-3xl: 1.875rem;  /* 30px - Large headings */
--text-4xl: 2.25rem;   /* 36px - Display headings */
```

### Font Weights
- **400**: Normal text
- **500**: Medium emphasis
- **600**: Semibold for headings
- **700**: Bold for strong emphasis

### Usage Guidelines
- Use consistent line heights (1.5 for body text)
- Maintain proper heading hierarchy (h1 → h2 → h3)
- Ensure text remains readable at all zoom levels
- Use appropriate font weights for hierarchy

## Spacing System

### Scale
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

### Usage Guidelines
- Use consistent spacing throughout the application
- Follow the 8px grid system
- Maintain proper spacing relationships
- Adjust spacing for different screen sizes

## Component Library

### Button Component

#### Variants
- **Primary**: Main actions (blue background)
- **Secondary**: Secondary actions (gray background)
- **Ghost**: Subtle actions (transparent background)
- **Danger**: Destructive actions (red background)

#### Sizes
- **Small**: 32px height, 12px padding
- **Medium**: 40px height, 16px padding
- **Large**: 48px height, 20px padding

#### States
- Default
- Hover
- Focus
- Active
- Disabled
- Loading

#### Usage
```tsx
<Button variant="primary" size="medium">
  Primary Action
</Button>
```

### Input Component

#### Variants
- **Default**: Standard input
- **Filled**: Filled background
- **Outlined**: Outlined border

#### States
- Default
- Focus
- Error
- Disabled
- Loading

#### Features
- Label support
- Helper text
- Error messages
- Icon support
- Validation states

#### Usage
```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  helperText="We'll never share your email"
  error={errors.email}
/>
```

### Card Component

#### Variants
- **Default**: Basic card
- **Elevated**: With shadow
- **Outlined**: With border

#### Padding Options
- **None**: No padding
- **Small**: 12px padding
- **Medium**: 16px padding
- **Large**: 24px padding

#### Usage
```tsx
<Card variant="elevated" padding="lg">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

### Chat Components

#### ChatMessage
- User/assistant differentiation
- Timestamp display
- Action buttons (copy, regenerate, feedback)
- Markdown support
- Loading states

#### ChatInput
- Auto-resize textarea
- Character count
- Send button
- Keyboard shortcuts
- Validation

#### TypingIndicator
- Multiple animation variants
- Customizable messages
- Smooth transitions

## Layout System

### Container Sizes
- **Mobile**: Full width with 16px padding
- **Tablet**: 768px max-width
- **Desktop**: 1024px max-width
- **Large**: 1280px max-width

### Grid System
- 12-column grid
- Responsive breakpoints
- Flexible gutters
- CSS Grid and Flexbox

### Breakpoints
```css
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
```

## Animation Guidelines

### Durations
- **Fast**: 150ms - Micro-interactions
- **Normal**: 250ms - Standard transitions
- **Slow**: 350ms - Complex animations

### Easing
- **Ease-out**: For entrances
- **Ease-in**: For exits
- **Ease-in-out**: For state changes

### Principles
- Respect `prefers-reduced-motion`
- Use purposeful animations
- Maintain 60fps performance
- Keep animations subtle

## Accessibility Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order
- Visible focus indicators
- Escape key support for modals

### Screen Readers
- Proper semantic HTML
- ARIA labels and descriptions
- Live regions for dynamic content
- Meaningful link text

### Color and Contrast
- 4.5:1 minimum contrast ratio
- Don't rely on color alone
- Support high contrast mode
- Test with color blindness simulators

### Touch Targets
- Minimum 44px touch targets
- Adequate spacing between targets
- Touch-friendly interactions
- Avoid hover-dependent functionality

## Theme System

### Light Theme
- White backgrounds
- Dark text
- Subtle shadows
- High contrast

### Dark Theme
- Dark backgrounds
- Light text
- Reduced shadows
- Maintained contrast ratios

### Custom Themes
- Environment-based configuration
- CSS custom properties
- Smooth transitions
- Consistent branding

## Best Practices

### Component Development
1. Start with accessibility in mind
2. Use semantic HTML
3. Implement proper TypeScript types
4. Write comprehensive tests
5. Document component APIs

### Performance
1. Lazy load non-critical components
2. Optimize images and assets
3. Use proper caching strategies
4. Monitor bundle sizes
5. Implement code splitting

### Maintenance
1. Follow consistent naming conventions
2. Keep components focused and reusable
3. Document breaking changes
4. Maintain backward compatibility
5. Regular accessibility audits

## Testing Guidelines

### Unit Tests
- Test component behavior
- Test accessibility features
- Test responsive behavior
- Test error states

### Integration Tests
- Test user workflows
- Test keyboard navigation
- Test screen reader compatibility
- Test theme switching

### Visual Regression Tests
- Test component appearance
- Test responsive layouts
- Test theme variations
- Test animation states

## Browser Support

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Enhancement
- Core functionality works in all browsers
- Enhanced features for modern browsers
- Graceful degradation for older browsers
- Polyfills for critical features

## Resources

### Tools
- [Figma Design System](link-to-figma)
- [Storybook Component Library](link-to-storybook)
- [Accessibility Checker](link-to-a11y-tool)
- [Color Contrast Analyzer](link-to-contrast-tool)

### References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)

## Changelog

### Version 1.0.0
- Initial design system implementation
- Core component library
- Accessibility features
- Theme system
- Performance optimizations