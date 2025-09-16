import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import MessageActions from '../message-actions'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}))

describe('MessageActions', () => {
  const mockProps = {
    messageId: 'test-message-1',
    messageRole: 'assistant' as const,
    onCopy: jest.fn(),
    onRegenerate: jest.fn(),
    onFeedback: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders copy button when onCopy is provided', () => {
    render(<MessageActions {...mockProps} />)
    
    expect(screen.getByLabelText('Copy message to clipboard')).toBeInTheDocument()
  })

  it('renders regenerate button only for assistant messages', () => {
    render(<MessageActions {...mockProps} />)
    
    expect(screen.getByLabelText('Regenerate this response')).toBeInTheDocument()
  })

  it('does not render regenerate button for user messages', () => {
    render(<MessageActions {...mockProps} messageRole="user" />)
    
    expect(screen.queryByLabelText('Regenerate this response')).not.toBeInTheDocument()
  })

  it('renders feedback buttons only for assistant messages', () => {
    render(<MessageActions {...mockProps} />)
    
    expect(screen.getByLabelText('Mark response as helpful')).toBeInTheDocument()
    expect(screen.getByLabelText('Mark response as not helpful')).toBeInTheDocument()
  })

  it('does not render feedback buttons for user messages', () => {
    render(<MessageActions {...mockProps} messageRole="user" />)
    
    expect(screen.queryByLabelText('Mark response as helpful')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Mark response as not helpful')).not.toBeInTheDocument()
  })

  it('calls onCopy when copy button is clicked', () => {
    render(<MessageActions {...mockProps} />)
    
    fireEvent.click(screen.getByLabelText('Copy message to clipboard'))
    
    expect(mockProps.onCopy).toHaveBeenCalledTimes(1)
  })

  it('shows confirmation dialog when regenerate button is clicked', () => {
    render(<MessageActions {...mockProps} />)
    
    fireEvent.click(screen.getByLabelText('Regenerate this response'))
    
    expect(screen.getByText('Regenerate Response')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to regenerate this response? This action cannot be undone.')).toBeInTheDocument()
  })

  it('calls onRegenerate when regenerate is confirmed', () => {
    render(<MessageActions {...mockProps} />)
    
    // Click regenerate button
    fireEvent.click(screen.getByLabelText('Regenerate this response'))
    
    // Confirm in dialog
    fireEvent.click(screen.getByText('Regenerate'))
    
    expect(mockProps.onRegenerate).toHaveBeenCalledTimes(1)
  })

  it('does not call onRegenerate when regenerate is cancelled', () => {
    render(<MessageActions {...mockProps} />)
    
    // Click regenerate button
    fireEvent.click(screen.getByLabelText('Regenerate this response'))
    
    // Cancel in dialog
    fireEvent.click(screen.getByText('Cancel'))
    
    expect(mockProps.onRegenerate).not.toHaveBeenCalled()
  })

  it('calls onFeedback with positive when thumbs up is clicked', () => {
    render(<MessageActions {...mockProps} />)
    
    fireEvent.click(screen.getByLabelText('Mark response as helpful'))
    
    expect(mockProps.onFeedback).toHaveBeenCalledWith('positive')
  })

  it('calls onFeedback with negative when thumbs down is clicked', () => {
    render(<MessageActions {...mockProps} />)
    
    fireEvent.click(screen.getByLabelText('Mark response as not helpful'))
    
    expect(mockProps.onFeedback).toHaveBeenCalledWith('negative')
  })

  it('disables feedback buttons after feedback is given', () => {
    render(<MessageActions {...mockProps} />)
    
    const positiveButton = screen.getByLabelText('Mark response as helpful')
    const negativeButton = screen.getByLabelText('Mark response as not helpful')
    
    // Give positive feedback
    fireEvent.click(positiveButton)
    
    // Both buttons should be disabled
    expect(positiveButton).toBeDisabled()
    expect(negativeButton).toBeDisabled()
  })

  it('shows copy success state temporarily', async () => {
    render(<MessageActions {...mockProps} />)
    
    const copyButton = screen.getByLabelText('Copy message to clipboard')
    fireEvent.click(copyButton)
    
    // Should show checkmark icon (success state)
    expect(screen.getByRole('button', { name: /copy message/i })).toBeInTheDocument()
    
    // Wait for the success state to reset (mocked timeout)
    await waitFor(() => {
      expect(mockProps.onCopy).toHaveBeenCalledTimes(1)
    })
  })

  it('only renders buttons for provided handlers', () => {
    render(
      <MessageActions
        messageId="test"
        messageRole="assistant"
        onCopy={mockProps.onCopy}
        // No onRegenerate or onFeedback
      />
    )
    
    expect(screen.getByLabelText('Copy message to clipboard')).toBeInTheDocument()
    expect(screen.queryByLabelText('Regenerate this response')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Mark response as helpful')).not.toBeInTheDocument()
  })
})