import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Button from '../button'

// Mock icon component for testing
const MockIcon = () => <span data-testid="mock-icon">Icon</span>

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'button')
    })

    it('renders with custom text', () => {
      render(<Button>Custom Text</Button>)
      expect(screen.getByRole('button', { name: 'Custom Text' })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-foreground')
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })
  })

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-4', 'text-sm')
    })

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8', 'px-3', 'text-xs')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-12', 'px-6', 'text-base')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    it('handles loading state', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveAttribute('aria-label', 'Loading...')
      expect(screen.getByRole('button')).toHaveTextContent('Loading')
    })

    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      const spinner = screen.getByRole('button').querySelector('[aria-hidden="true"]')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('combines loading with aria-label', () => {
      render(<Button loading aria-label="Submit form">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Loading... Submit form')
    })
  })

  describe('Icon Support', () => {
    it('renders with icon', () => {
      render(<Button icon={<MockIcon />}>With Icon</Button>)
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveTextContent('With Icon')
    })

    it('hides icon when loading', () => {
      render(<Button loading icon={<MockIcon />}>Loading</Button>)
      expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument()
    })

    it('renders icon without text', () => {
      render(<Button icon={<MockIcon />} aria-label="Icon only" />)
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Icon only')
    })
  })

  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not trigger click when disabled', () => {
      const handleClick = jest.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not trigger click when loading', () => {
      const handleClick = jest.fn()
      render(<Button loading onClick={handleClick}>Loading</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles keyboard events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Button</Button>)
      const button = screen.getByRole('button')
      
      fireEvent.keyDown(button, { key: 'Enter' })
      fireEvent.keyUp(button, { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('has proper focus management', () => {
      render(<Button>Focusable</Button>)
      const button = screen.getByRole('button')
      
      button.focus()
      expect(button).toHaveFocus()
    })

    it('supports custom aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label')
    })

    it('has proper button role', () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('supports different button types', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })
  })

  describe('Loading Spinner Sizes', () => {
    it('shows correct spinner size for small button', () => {
      render(<Button size="sm" loading>Small Loading</Button>)
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).toHaveClass('h-3', 'w-3')
    })

    it('shows correct spinner size for medium button', () => {
      render(<Button size="md" loading>Medium Loading</Button>)
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).toHaveClass('h-4', 'w-4')
    })

    it('shows correct spinner size for large button', () => {
      render(<Button size="lg" loading>Large Loading</Button>)
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).toHaveClass('h-5', 'w-5')
    })
  })

  describe('Forward Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Button</Button>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current).toBe(screen.getByRole('button'))
    })
  })
})