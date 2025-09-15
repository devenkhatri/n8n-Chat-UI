import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock the dependencies
jest.mock('../button', () => ({
  Button: ({ children, onClick, className, disabled, loading, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
      data-loading={loading}
      {...props}
    >
      {children}
    </button>
  )
}))

jest.mock('../card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  )
}))

jest.mock('../layout', () => ({
  __esModule: true,
  default: {
    Flex: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    )
  }
}))

jest.mock('@heroicons/react/24/outline', () => ({
  HandThumbUpIcon: () => <span>👍</span>,
  HandThumbDownIcon: () => <span>👎</span>,
  ChatBubbleLeftEllipsisIcon: () => <span>💬</span>,
  XMarkIcon: () => <span>✕</span>
}))

jest.mock('@heroicons/react/24/solid', () => ({
  HandThumbUpIcon: () => <span>👍✓</span>,
  HandThumbDownIcon: () => <span>👎✓</span>
}))

import { MessageFeedbackComponent } from '../message-feedback'

describe('MessageFeedbackComponent', () => {
  const defaultProps = {
    messageId: 'test-message-1',
    onFeedback: jest.fn(),
    onRemoveFeedback: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders feedback buttons', () => {
    render(<MessageFeedbackComponent {...defaultProps} />)
    
    expect(screen.getByText('Was this helpful?')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('renders in compact mode', () => {
    render(<MessageFeedbackComponent {...defaultProps} compact />)
    
    expect(screen.queryByText('Was this helpful?')).not.toBeInTheDocument()
    expect(screen.getByText('👍')).toBeInTheDocument()
    expect(screen.getByText('👎')).toBeInTheDocument()
  })

  it('shows positive feedback as selected', () => {
    const feedback = {
      rating: 'positive' as const,
      timestamp: new Date()
    }
    
    render(<MessageFeedbackComponent {...defaultProps} feedback={feedback} />)
    
    expect(screen.getByText('👍✓')).toBeInTheDocument()
    expect(screen.getByText(/Feedback submitted/)).toBeInTheDocument()
  })

  it('shows negative feedback as selected', () => {
    const feedback = {
      rating: 'negative' as const,
      comment: 'Could be better',
      timestamp: new Date()
    }
    
    render(<MessageFeedbackComponent {...defaultProps} feedback={feedback} />)
    
    expect(screen.getByText('👎✓')).toBeInTheDocument()
    expect(screen.getByText('"Could be better"')).toBeInTheDocument()
  })

  it('calls onFeedback when positive button is clicked', async () => {
    render(<MessageFeedbackComponent {...defaultProps} />)
    
    const positiveButton = screen.getByText('Yes').closest('button')!
    fireEvent.click(positiveButton)
    
    await waitFor(() => {
      expect(defaultProps.onFeedback).toHaveBeenCalledWith('test-message-1', 'positive')
    })
  })

  it('shows comment form when negative button is clicked', () => {
    render(<MessageFeedbackComponent {...defaultProps} />)
    
    const negativeButton = screen.getByText('No').closest('button')!
    fireEvent.click(negativeButton)
    
    expect(screen.getByText('Help us improve')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('What could be better? (optional)')).toBeInTheDocument()
  })

  it('submits negative feedback with comment', async () => {
    render(<MessageFeedbackComponent {...defaultProps} />)
    
    // Click negative button to show form
    const negativeButton = screen.getByText('No').closest('button')!
    fireEvent.click(negativeButton)
    
    // Enter comment
    const textarea = screen.getByPlaceholderText('What could be better? (optional)')
    fireEvent.change(textarea, { target: { value: 'Needs improvement' } })
    
    // Submit feedback
    const submitButton = screen.getByText('Submit Feedback')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(defaultProps.onFeedback).toHaveBeenCalledWith('test-message-1', 'negative', 'Needs improvement')
    })
  })

  it('cancels comment form', () => {
    render(<MessageFeedbackComponent {...defaultProps} />)
    
    // Click negative button to show form
    const negativeButton = screen.getByText('No').closest('button')!
    fireEvent.click(negativeButton)
    
    // Cancel
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(screen.queryByText('Help us improve')).not.toBeInTheDocument()
  })

  it('removes feedback when same rating is clicked', async () => {
    const feedback = {
      rating: 'positive' as const,
      timestamp: new Date()
    }
    
    render(<MessageFeedbackComponent {...defaultProps} feedback={feedback} />)
    
    const positiveButton = screen.getByText('Yes').closest('button')!
    fireEvent.click(positiveButton)
    
    await waitFor(() => {
      expect(defaultProps.onRemoveFeedback).toHaveBeenCalledWith('test-message-1')
    })
  })

  it('shows character count for comment', () => {
    render(<MessageFeedbackComponent {...defaultProps} />)
    
    // Click negative button to show form
    const negativeButton = screen.getByText('No').closest('button')!
    fireEvent.click(negativeButton)
    
    const textarea = screen.getByPlaceholderText('What could be better? (optional)')
    fireEvent.change(textarea, { target: { value: 'Test comment' } })
    
    expect(screen.getByText('12/500 characters')).toBeInTheDocument()
  })

  it('disables buttons when disabled prop is true', () => {
    render(<MessageFeedbackComponent {...defaultProps} disabled />)
    
    const positiveButton = screen.getByText('Yes').closest('button')!
    const negativeButton = screen.getByText('No').closest('button')!
    
    expect(positiveButton).toBeDisabled()
    expect(negativeButton).toBeDisabled()
  })

  it('calls onRemoveFeedback when remove button is clicked', () => {
    const feedback = {
      rating: 'positive' as const,
      timestamp: new Date()
    }
    
    render(<MessageFeedbackComponent {...defaultProps} feedback={feedback} />)
    
    const removeButton = screen.getByText('✕').closest('button')!
    fireEvent.click(removeButton)
    
    expect(defaultProps.onRemoveFeedback).toHaveBeenCalledWith('test-message-1')
  })
})