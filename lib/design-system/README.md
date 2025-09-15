# n8n Chat UI Design System

A modern, accessible design system built for the n8n Chat UI application. This design system provides a comprehensive set of design tokens, components, and utilities to ensure consistent and scalable UI development.

## Features

- **Design Tokens**: Centralized color, typography, spacing, and animation values using CSS custom properties
- **Component Variants**: Type-safe component variants using class-variance-authority
- **Accessibility**: WCAG 2.1 AA compliant components with proper ARIA support
- **Dark Mode**: Built-in dark mode support with smooth transitions
- **TypeScript**: Full TypeScript support with comprehensive type definitions
- **Responsive**: Mobile-first responsive design patterns

## Installation

The design system dependencies are already installed:

```bash
npm install framer-motion @headlessui/react class-variance-authority clsx tailwind-merge
```

## Usage

### Design Tokens

Access design tokens through CSS custom properties or the TypeScript configuration:

```typescript
import { designTokens } from './lib/design-system'

// Use in JavaScript/TypeScript
const primaryColor = designTokens.colors.primary[500]

// Use in CSS
.my-component {
  color: var(--color-primary-500);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}
```

### Components

Import and use components from the design system:

```typescript
import { Button, Input, Card } from './components/ui'

function MyComponent() {
  return (
    <Card variant="elevated" padding="lg">
      <Input 
        label="Email" 
        placeholder="Enter your email"
        variant="outlined"
        size="md"
      />
      <Button variant="primary" size="lg">
        Submit
      </Button>
    </Card>
  )
}
```

### Utilities

Use the `cn` utility for conditional class names:

```typescript
import { cn } from './lib/utils'

function MyComponent({ isActive, className }) {
  return (
    <div className={cn(
      "base-styles",
      isActive && "active-styles",
      className
    )}>
      Content
    </div>
  )
}
```

## Design Tokens

### Colors

- **Primary**: Blue color palette for primary actions and branding
- **Secondary**: Gray color palette for secondary elements
- **Semantic**: Success (green), Warning (yellow), Error (red), Info (cyan)
- **Neutral**: Comprehensive gray scale for text and backgrounds
- **Surface**: Background, surface, and foreground colors with dark mode support

### Typography

- **Font Families**: Inter for sans-serif, JetBrains Mono for monospace
- **Font Sizes**: xs (12px) to 4xl (36px) with consistent line heights
- **Font Weights**: thin (100) to black (900)

### Spacing

- **Scale**: 0 to 32 with consistent 4px increments
- **Usage**: Padding, margins, gaps, and positioning

### Border Radius

- **Scale**: none, sm, base, md, lg, xl, 2xl, 3xl, full
- **Usage**: Consistent corner rounding across components

### Shadows

- **Scale**: sm, base, md, lg, xl, 2xl, inner
- **Usage**: Elevation and depth for cards and overlays

### Animation

- **Durations**: 75ms to 1000ms for different interaction types
- **Easing**: Linear, ease-in, ease-out, ease-in-out curves

## Component Architecture

### Base Components

- **Button**: Primary, secondary, ghost, and danger variants
- **Input**: Default, filled, and outlined variants with validation states
- **Card**: Default, elevated, and outlined variants

### Chat Components

- **ChatMessage**: Message display with user/assistant differentiation
- **ChatInput**: Enhanced input for message composition
- **TypingIndicator**: Animated typing states

### Layout Components

- **Header**: Application header with branding and actions

### Feature Components

- **ThemeToggle**: Dark/light mode switching
- **ErrorBoundary**: Error handling and recovery
- **Toast**: Notification system

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and announcements
- **Color Contrast**: Minimum 4.5:1 contrast ratios
- **Focus Management**: Visible focus indicators and logical tab order

## Dark Mode

Dark mode is supported through:

- CSS custom properties that change based on `prefers-color-scheme`
- Manual theme switching with the `.dark` class
- Smooth transitions between themes

## Responsive Design

Mobile-first approach with breakpoints:

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Development

### Adding New Components

1. Create component in `components/ui/`
2. Add TypeScript interfaces in `lib/types/ui.ts`
3. Create variants in `lib/variants/` if needed
4. Export from `components/ui/index.ts`
5. Update this README

### Adding New Tokens

1. Add CSS custom properties to `app/globals.css`
2. Update `lib/design-system/tokens.ts`
3. Update Tailwind config if needed
4. Document usage in this README

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This design system is part of the n8n Chat UI project.