import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Input from '../input'

// Mock icon component for testing
const MockIcon = () => <span data-testid="mock-icon">Icon</span>

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Enter text')
    })

    it('renders with label', () => {
      render(<Input label="Username" placeholder="Enter username" />)
      const label = screen.getByText('Username')
      const input = screen.getByRole('textbox')
      
      expect(label).toBeInTheDocument()
      expect(label).toHaveAttribute('for', input.id)
    })

    it('applies custom className', () => {
      render(<Input className="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
    })

    it('generates unique IDs when not provided', () => {
      render(
        <div>
          <Input label="First" />
          <Input label="Second" />
        </div>
      )
      
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0].id).not.toBe(inputs[1].id)
      expect(inputs[0].id).toBeTruthy()
      expect(inputs[1].id).toBeTruthy()
    })

    it('uses provided ID', () => {
      render(<Input id="custom-id" label="Custom" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'custom-id')
    })
  })

  describe('Variants', () => {
    it('renders default variant by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-input', 'bg-background')
    })

    it('renders filled variant', () => {
      render(<Input variant="filled" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-transparent', 'bg-muted')
    })

    it('renders outlined variant', () => {
      render(<Input variant="outlined" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-2', 'bg-transparent')
    })
  })

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('h-10', 'px-3', 'text-sm')
    })

    it('renders small size', () => {
      render(<Input size="sm" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('h-8', 'px-2', 'text-xs')
    })

    it('renders large size', () => {
      render(<Input size="lg" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('h-12', 'px-4', 'text-base')
    })
  })

  describe('States and Validation', () => {
    it('shows error state with error message', () => {
      render(<Input label="Email" error="Invalid email address" />)
      
      const input = screen.getByRole('textbox')
      const errorMessage = screen.getByText('Invalid email address')
      
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveClass('border-destructive')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage.closest('[role="alert"]')).toBeInTheDocument()
    })

    it('shows helper text when no error', () => {
      render(<Input label="Password" helperText="Must be at least 8 characters" />)
      
      const helperText = screen.getByText('Must be at least 8 characters')
      expect(helperText).toBeInTheDocument()
      expect(helperText.closest('[role="status"]')).toBeInTheDocument()
    })

    it('prioritizes error over helper text', () => {
      render(
        <Input 
          label="Email" 
          error="Invalid email" 
          helperText="Enter your email address" 
        />
      )
      
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
      expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument()
    })

    it('shows success state with value', async () => {
      const user = userEvent.setup()
      render(<Input label="Username" />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'validuser')
      await user.tab() // Blur the input
      
      await waitFor(() => {
        expect(input).toHaveClass('border-success')
      })
    })

    it('handles required field indicator', () => {
      render(<Input label="Required Field" required />)
      
      const label = screen.getByText('Required Field')
      expect(label).toHaveClass('after:content-[\'*\']')
    })

    it('handles disabled state', () => {
      render(<Input disabled placeholder="Disabled input" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })
  })

  describe('Icon Support', () => {
    it('renders with left icon', () => {
      render(<Input leftIcon={<MockIcon />} placeholder="With left icon" />)
      
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('pl-10')
    })

    it('renders with right icon', () => {
      render(<Input rightIcon={<MockIcon />} placeholder="With right icon" />)
      
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('pr-10')
    })

    it('renders with both icons', () => {
      render(
        <Input 
          leftIcon={<MockIcon />} 
          rightIcon={<MockIcon />} 
          placeholder="With both icons" 
        />
      )
      
      const icons = screen.getAllByTestId('mock-icon')
      expect(icons).toHaveLength(2)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('pl-10', 'pr-10')
    })

    it('shows error icon when there is an error', () => {
      render(<Input error="Error message" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('pr-10')
      
      // Error icon should be present (ExclamationIcon)
      const container = input.parentElement
      const errorIcon = container?.querySelector('[aria-hidden="true"]')
      expect(errorIcon).toBeInTheDocument()
    })

    it('shows success icon when input has value and no error', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Enter text" />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'valid input')
      await user.tab() // Blur to trigger success state
      
      await waitFor(() => {
        expect(input).toHaveClass('pr-10')
      })
    })

    it('adjusts padding for different sizes with icons', () => {
      const { rerender } = render(<Input size="sm" leftIcon={<MockIcon />} />)
      expect(screen.getByRole('textbox')).toHaveClass('pl-8')
      
      rerender(<Input size="lg" leftIcon={<MockIcon />} />)
      expect(screen.getByRole('textbox')).toHaveClass('pl-12')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Input 
          label="Email" 
          error="Invalid email" 
          helperText="Enter your email address"
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby')
    })

    it('associates label with input', () => {
      render(<Input label="Username" />)
      
      const label = screen.getByText('Username')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', input.id)
    })

    it('announces errors with proper ARIA live region', () => {
      render(<Input error="This field is required" />)
      
      const errorElement = screen.getByText('This field is required')
      expect(errorElement.closest('[role="alert"]')).toBeInTheDocument()
      expect(errorElement.closest('[aria-live="assertive"]')).toBeInTheDocument()
    })

    it('announces helper text with proper ARIA live region', () => {
      render(<Input helperText="Enter at least 8 characters" />)
      
      const helperElement = screen.getByText('Enter at least 8 characters')
      expect(helperElement.closest('[role="status"]')).toBeInTheDocument()
      expect(helperElement.closest('[aria-live="polite"]')).toBeInTheDocument()
    })

    it('supports custom aria-describedby', () => {
      render(<Input aria-describedby="custom-description" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'custom-description')
    })

    it('combines multiple aria-describedby values', () => {
      render(
        <Input 
          error="Error message" 
          helperText="Helper text"
          aria-describedby="custom-description"
        />
      )
      
      const input = screen.getByRole('textbox')
      const describedBy = input.getAttribute('aria-describedby')
      expect(describedBy).toContain('custom-description')
    })
  })

  describe('Interactions', () => {
    it('handles focus and blur events', async () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
      
      const input = screen.getByRole('textbox')
      await user.click(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
      
      await user.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('handles change events', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      expect(handleChange).toHaveBeenCalledTimes(4) // Once for each character
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <Input placeholder="First input" />
          <Input placeholder="Second input" />
        </div>
      )
      
      const firstInput = screen.getByPlaceholderText('First input')
      const secondInput = screen.getByPlaceholderText('Second input')
      
      await user.click(firstInput)
      expect(firstInput).toHaveFocus()
      
      await user.tab()
      expect(secondInput).toHaveFocus()
    })
  })

  describe('Focus Management', () => {
    it('manages focus state correctly', async () => {
      const user = userEvent.setup()
      render(<Input value="test value" />)
      
      const input = screen.getByRole('textbox')
      
      // Initially not focused, should show success state
      expect(input).toHaveClass('border-success')
      
      // When focused, should not show success state
      await user.click(input)
      expect(input).not.toHaveClass('border-success')
      
      // When blurred with value, should show success state again
      await user.tab()
      await waitFor(() => {
        expect(input).toHaveClass('border-success')
      })
    })
  })

  describe('Forward Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current).toBe(screen.getByRole('textbox'))
    })
  })

  describe('Input Types', () => {
    it('supports different input types', () => {
      const { rerender } = render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
      
      rerender(<Input type="password" />)
      expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')
      
      rerender(<Input type="number" />)
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
    })
  })
})