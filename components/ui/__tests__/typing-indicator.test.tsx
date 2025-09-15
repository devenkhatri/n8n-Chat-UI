import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import TypingIndicator from '../typing-indicator'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('TypingIndicator', () => {
  it('renders when visible is true', () => {
    render(<TypingIndicator visible={true} />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('AI is typing...')).toBeInTheDocument()
  })

  it('does not render when visible is false', () => {
    render(<TypingIndicator visible={false} />)
    
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('displays custom message when provided', () => {
    const customMessage = 'Assistant is thinking...'
    render(<TypingIndicator visible={true} message={customMessage} />)
    
    expect(screen.getByLabelText(customMessage)).toBeInTheDocument()
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('displays default message when no message is provided', () => {
    render(<TypingIndicator visible={true} />)
    
    expect(screen.getByLabelText('AI is typing...')).toBeInTheDocument()
    expect(screen.getByText('AI is typing...')).toBeInTheDocument()
  })

  it('renders dots variant by default', () => {
    render(<TypingIndicator visible={true} />)
    
    // Should render the dots indicator (3 dots)
    const container = screen.getByRole('status')
    expect(container).toBeInTheDocument()
  })

  it('renders pulse variant when specified', () => {
    render(<TypingIndicator visible={true} variant="pulse" />)
    
    const container = screen.getByRole('status')
    expect(container).toBeInTheDocument()
  })

  it('renders wave variant when specified', () => {
    render(<TypingIndicator visible={true} variant="wave" />)
    
    const container = screen.getByRole('status')
    expect(container).toBeInTheDocument()
  })

  it('renders AI avatar', () => {
    render(<TypingIndicator visible={true} />)
    
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<TypingIndicator visible={true} className="custom-class" />)
    
    const container = screen.getByRole('status')
    expect(container).toHaveClass('custom-class')
  })

  it('renders custom children content', () => {
    render(
      <TypingIndicator visible={true}>
        <div data-testid="custom-content">Custom content</div>
      </TypingIndicator>
    )
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    expect(screen.getByText('Custom content')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<TypingIndicator visible={true} />)
    
    const container = screen.getByRole('status')
    expect(container).toHaveAttribute('aria-live', 'polite')
    expect(container).toHaveAttribute('aria-label', 'AI is typing...')
  })

  it('does not show message text when message is empty', () => {
    render(<TypingIndicator visible={true} message="" />)
    
    const container = screen.getByRole('status')
    expect(container).toBeInTheDocument()
    
    // Should not have any text content for the message
    expect(screen.queryByText('AI is typing...')).not.toBeInTheDocument()
  })

  it('handles undefined message gracefully', () => {
    render(<TypingIndicator visible={true} message={undefined} />)
    
    // Should fall back to default message
    expect(screen.getByLabelText('AI is typing...')).toBeInTheDocument()
  })
})