import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from '../chat-input'

// Mock the Button component
jest.mock('../button', () => {
  return React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  ))
})

describe('ChatInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    onSubmit: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', () => {
    render(<ChatInput {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    const submitButton = screen.getByRole('button', { name: /send message/i })
    
    expect(textarea).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', 'Type your message...')
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    await user.type(textarea, 'Hello world')
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('Hello world')
  })

  it('calls onSubmit when Enter is pressed', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<ChatInput {...defaultProps} value="Hello" onSubmit={onSubmit} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    await user.type(textarea, '{Enter}')
    
    expect(onSubmit).toHaveBeenCalledWith('Hello')
  })

  it('does not submit when Shift+Enter is pressed', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<ChatInput {...defaultProps} value="Hello" onSubmit={onSubmit} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    await user.type(textarea, '{Shift>}{Enter}{/Shift}')
    
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<ChatInput {...defaultProps} value="Hello" onSubmit={onSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    expect(onSubmit).toHaveBeenCalledWith('Hello')
  })

  it('does not submit empty messages', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<ChatInput {...defaultProps} value="   " onSubmit={onSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows character count when maxLength is provided', () => {
    render(<ChatInput {...defaultProps} value="Hello" maxLength={100} />)
    
    expect(screen.getByText('5/100')).toBeInTheDocument()
  })

  it('shows warning color when near character limit', () => {
    render(<ChatInput {...defaultProps} value="a".repeat(85) maxLength={100} />)
    
    const charCount = screen.getByText('85/100')
    expect(charCount).toHaveClass('text-warning')
  })

  it('shows error color when over character limit', () => {
    render(<ChatInput {...defaultProps} value="a".repeat(105) maxLength={100} />)
    
    const charCount = screen.getByText('105/100')
    expect(charCount).toHaveClass('text-destructive')
  })

  it('disables submit when over character limit', () => {
    render(<ChatInput {...defaultProps} value="a".repeat(105) maxLength={100} />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    expect(submitButton).toBeDisabled()
  })

  it('shows remaining messages count', () => {
    render(<ChatInput {...defaultProps} remainingMessages={5} />)
    
    expect(screen.getByText('5 messages remaining')).toBeInTheDocument()
  })

  it('shows warning when few messages remaining', () => {
    render(<ChatInput {...defaultProps} remainingMessages={3} />)
    
    const remainingText = screen.getByText('3 messages remaining')
    expect(remainingText).toHaveClass('text-warning')
  })

  it('shows error when no messages remaining', () => {
    render(<ChatInput {...defaultProps} remainingMessages={0} />)
    
    const remainingText = screen.getByText('0 messages remaining')
    expect(remainingText).toHaveClass('text-destructive')
  })

  it('disables input when at message limit', () => {
    render(<ChatInput {...defaultProps} remainingMessages={0} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveAttribute('placeholder', 'Message limit reached')
  })

  it('shows loading state correctly', () => {
    render(<ChatInput {...defaultProps} loading={true} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    const submitButton = screen.getByRole('button', { name: /send message/i })
    
    expect(textarea).toHaveAttribute('placeholder', 'Sending message...')
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Sending...')).toBeInTheDocument()
  })

  it('shows disabled state correctly', () => {
    render(<ChatInput {...defaultProps} disabled={true} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    const submitButton = screen.getByRole('button', { name: /send message/i })
    
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveAttribute('placeholder', 'Chat is disabled')
    expect(submitButton).toBeDisabled()
  })

  it('shows keyboard shortcut hint on desktop', () => {
    render(<ChatInput {...defaultProps} />)
    
    expect(screen.getByText('Press Enter to send, Shift+Enter for new line')).toBeInTheDocument()
  })

  it('applies focus styles when focused', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    await user.click(textarea)
    
    const container = textarea.closest('div')
    expect(container).toHaveClass('border-ring', 'ring-2', 'ring-ring/20')
  })

  it('handles custom placeholder', () => {
    render(<ChatInput {...defaultProps} placeholder="Custom placeholder" />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder')
  })

  it('renders children content', () => {
    render(
      <ChatInput {...defaultProps}>
        <div data-testid="custom-content">Custom content</div>
      </ChatInput>
    )
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
  })

  it('trims whitespace before submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<ChatInput {...defaultProps} value="  Hello world  " onSubmit={onSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    expect(onSubmit).toHaveBeenCalledWith('Hello world')
  })

  // Validation tests
  it('shows validation error for required field', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(
      <ChatInput 
        {...defaultProps} 
        value="" 
        onSubmit={onSubmit}
        validationRules={{ required: true }}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Message cannot be empty')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for minimum length', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(
      <ChatInput 
        {...defaultProps} 
        value="Hi" 
        onSubmit={onSubmit}
        validationRules={{ minLength: 5 }}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Message must be at least 5 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for pattern mismatch', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(
      <ChatInput 
        {...defaultProps} 
        value="Hello123" 
        onSubmit={onSubmit}
        validationRules={{ pattern: /^[a-zA-Z\s]+$/ }}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Message contains invalid characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows custom validation error', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    const customValidator = (value: string) => 
      value.includes('spam') ? 'Spam is not allowed' : null
    
    render(
      <ChatInput 
        {...defaultProps} 
        value="This is spam" 
        onSubmit={onSubmit}
        validationRules={{ customValidator }}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Spam is not allowed')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears validation error when user starts typing', async () => {
    const user = userEvent.setup()
    render(
      <ChatInput 
        {...defaultProps} 
        value="" 
        validationRules={{ required: true }}
      />
    )
    
    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    expect(screen.getByText('Message cannot be empty')).toBeInTheDocument()
    
    // Start typing to clear error
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    await user.type(textarea, 'H')
    
    expect(screen.queryByText('Message cannot be empty')).not.toBeInTheDocument()
  })

  // Error handling tests
  it('displays error message', () => {
    render(<ChatInput {...defaultProps} error="Network error occurred" />)
    
    expect(screen.getByText('Network error occurred')).toBeInTheDocument()
  })

  it('shows retry button when error and onRetry provided', () => {
    const onRetry = jest.fn()
    render(
      <ChatInput 
        {...defaultProps} 
        error="Network error occurred" 
        onRetry={onRetry}
      />
    )
    
    expect(screen.getByRole('button', { name: /retry sending message/i })).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()
    render(
      <ChatInput 
        {...defaultProps} 
        error="Network error occurred" 
        onRetry={onRetry}
      />
    )
    
    const retryButton = screen.getByRole('button', { name: /retry sending message/i })
    await user.click(retryButton)
    
    expect(onRetry).toHaveBeenCalled()
  })

  // Rate limiting tests
  it('shows rate limit message', () => {
    render(<ChatInput {...defaultProps} rateLimited={true} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    expect(textarea).toHaveAttribute('placeholder', 'Rate limited. Please wait before sending another message')
  })

  it('shows rate limit countdown', () => {
    const resetTime = new Date(Date.now() + 30000) // 30 seconds from now
    render(
      <ChatInput 
        {...defaultProps} 
        rateLimited={true} 
        rateLimitReset={resetTime}
      />
    )
    
    expect(screen.getByText(/Rate limited\. Try again in/)).toBeInTheDocument()
  })

  it('disables input when rate limited', () => {
    render(<ChatInput {...defaultProps} rateLimited={true} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    const submitButton = screen.getByRole('button', { name: /send message/i })
    
    expect(textarea).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('applies error border styling when there is an error', () => {
    render(<ChatInput {...defaultProps} error="Test error" />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    const container = textarea.closest('div')
    
    expect(container).toHaveClass('border-destructive', 'ring-2', 'ring-destructive/20')
  })

  // Keyboard shortcuts tests
  it('clears input when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<ChatInput {...defaultProps} value="Hello world" onChange={onChange} />)
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    await user.type(textarea, '{Escape}')
    
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('clears validation error when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(
      <ChatInput 
        {...defaultProps} 
        value="" 
        onChange={onChange}
        validationRules={{ required: true }}
      />
    )
    
    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    expect(screen.getByText('Message cannot be empty')).toBeInTheDocument()
    
    // Press Escape to clear
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    await user.type(textarea, '{Escape}')
    
    expect(screen.queryByText('Message cannot be empty')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith('')
  })

  // Accessibility tests
  it('has proper ARIA attributes', () => {
    render(
      <ChatInput 
        {...defaultProps} 
        maxLength={100}
        remainingMessages={5}
        validationRules={{ required: true }}
      />
    )
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    
    expect(textarea).toHaveAttribute('aria-required', 'true')
    expect(textarea).toHaveAttribute('aria-describedby')
    expect(textarea).toHaveAttribute('aria-invalid', 'false')
  })

  it('announces validation errors to screen readers', async () => {
    const user = userEvent.setup()
    render(
      <ChatInput 
        {...defaultProps} 
        value="" 
        validationRules={{ required: true }}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toHaveAttribute('aria-live', 'assertive')
    expect(errorMessage).toHaveTextContent('Message cannot be empty')
  })

  it('has screen reader announcements region', () => {
    render(<ChatInput {...defaultProps} />)
    
    const announcementRegion = screen.getByRole('status')
    expect(announcementRegion).toHaveAttribute('aria-live', 'polite')
    expect(announcementRegion).toHaveAttribute('aria-atomic', 'true')
    expect(announcementRegion).toHaveClass('sr-only')
  })

  it('provides keyboard shortcut information', () => {
    render(<ChatInput {...defaultProps} />)
    
    const shortcutInfo = screen.getByText('Press Enter to send, Shift+Enter for new line')
    expect(shortcutInfo).toHaveAttribute('aria-label')
    expect(shortcutInfo.getAttribute('aria-label')).toContain('Keyboard shortcuts')
  })

  it('has proper form labeling', () => {
    render(<ChatInput {...defaultProps} />)
    
    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('aria-label', 'Send message form')
    
    const region = screen.getByRole('region')
    expect(region).toHaveAttribute('aria-label', 'Message input area')
  })

  it('updates aria-invalid when validation error occurs', async () => {
    const user = userEvent.setup()
    render(
      <ChatInput 
        {...defaultProps} 
        value="" 
        validationRules={{ required: true }}
      />
    )
    
    const textarea = screen.getByRole('textbox', { name: /message input/i })
    expect(textarea).toHaveAttribute('aria-invalid', 'false')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
  })

  it('provides character count status to screen readers', () => {
    render(<ChatInput {...defaultProps} value="Hello" maxLength={100} />)
    
    const charCount = screen.getByText('5/100')
    expect(charCount).toHaveAttribute('role', 'status')
    expect(charCount).toHaveAttribute('aria-live', 'polite')
    expect(charCount).toHaveAttribute('aria-label', '5 of 100 characters')
  })
})