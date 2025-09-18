import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatMessage from '../chat-message'
import { type ChatMessage as ChatMessageType } from '../../../lib/types/ui'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}))

const mockUserMessage: ChatMessageType = {
  id: '1',
  role: 'user',
  content: 'Hello, how are you?',
  timestamp: new Date('2024-01-01T12:00:00Z'),
  status: 'sent'
}

const mockAssistantMessage: ChatMessageType = {
  id: '2',
  role: 'assistant',
  content: 'I am doing well, thank you for asking!',
  timestamp: new Date('2024-01-01T12:01:00Z'),
  status: 'sent',
  metadata: {
    model: 'gpt-4',
    tokens: 15,
    processingTime: 1200
  }
}

const mockSystemMessage: ChatMessageType = {
  id: '3',
  role: 'system',
  content: 'System initialized successfully',
  timestamp: new Date('2024-01-01T11:59:00Z')
}

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    render(<ChatMessage message={mockUserMessage} />)
    
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument()
    expect(screen.getByLabelText('user message')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument() // User avatar
  })

  it('renders assistant message correctly', () => {
    render(<ChatMessage message={mockAssistantMessage} />)
    
    expect(screen.getByText('I am doing well, thank you for asking!')).toBeInTheDocument()
    expect(screen.getByLabelText('assistant message')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument() // Assistant avatar
  })

  it('renders system message correctly', () => {
    render(<ChatMessage message={mockSystemMessage} />)
    
    expect(screen.getByText('System initialized successfully')).toBeInTheDocument()
    expect(screen.getByLabelText('system message')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument() // System avatar
  })

  it('displays message metadata when available', () => {
    render(<ChatMessage message={mockAssistantMessage} />)
    
    expect(screen.getByText('Model: gpt-4')).toBeInTheDocument()
    expect(screen.getByText('Tokens: 15')).toBeInTheDocument()
    expect(screen.getByText('Time: 1200ms')).toBeInTheDocument()
  })

  it('displays status indicators correctly', () => {
    const sendingMessage = { ...mockUserMessage, status: 'sending' as const }
    render(<ChatMessage message={sendingMessage} />)
    
    expect(screen.getByLabelText('Sending message')).toBeInTheDocument()
  })

  it('displays feedback indicators when available', () => {
    const messageWithFeedback = {
      ...mockAssistantMessage,
      feedback: { rating: 'positive' as const, comment: 'Great response!' }
    }
    render(<ChatMessage message={messageWithFeedback} />)
    
    expect(screen.getByTitle('Feedback: positive')).toBeInTheDocument()
    expect(screen.getByText('👍')).toBeInTheDocument()
  })

  it('renders custom children content', () => {
    render(
      <ChatMessage message={mockUserMessage}>
        <div data-testid="custom-content">Custom content</div>
      </ChatMessage>
    )
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    expect(screen.getByText('Custom content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ChatMessage message={mockUserMessage} className="custom-class" />)
    
    const messageElement = screen.getByLabelText('user message')
    expect(messageElement).toHaveClass('custom-class')
  })

  it('formats timestamps correctly', () => {
    // Mock current time to be 1 hour after the message timestamp
    const mockNow = new Date('2024-01-01T13:00:00Z')
    jest.spyOn(Date, 'now').mockImplementation(() => mockNow.getTime())
    
    render(<ChatMessage message={mockUserMessage} />)
    
    // The timestamp should show "1h ago"
    expect(screen.getByText('1h ago')).toBeInTheDocument()
    
    jest.restoreAllMocks()
  })

  it('handles error status correctly', () => {
    const errorMessage = { ...mockUserMessage, status: 'error' as const }
    render(<ChatMessage message={errorMessage} />)
    
    expect(screen.getByLabelText('Message failed to send')).toBeInTheDocument()
  })

  it('handles regenerating status correctly', () => {
    const regeneratingMessage = { ...mockAssistantMessage, status: 'regenerating' as const }
    render(<ChatMessage message={regeneratingMessage} />)
    
    expect(screen.getByLabelText('Regenerating response')).toBeInTheDocument()
  })

  it('renders message actions when showActions is true', () => {
    const mockOnCopy = jest.fn()
    const mockOnRegenerate = jest.fn()
    const mockOnFeedback = jest.fn()
    
    render(
      <ChatMessage 
        message={mockAssistantMessage} 
        showActions={true}
        onCopy={mockOnCopy}
        onRegenerate={mockOnRegenerate}
        onFeedback={mockOnFeedback}
      />
    )
    
    expect(screen.getByLabelText('Copy message to clipboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Regenerate this response')).toBeInTheDocument()
    expect(screen.getByLabelText('Mark response as helpful')).toBeInTheDocument()
    expect(screen.getByLabelText('Mark response as not helpful')).toBeInTheDocument()
  })

  it('does not render message actions when showActions is false', () => {
    const mockOnCopy = jest.fn()
    
    render(
      <ChatMessage 
        message={mockAssistantMessage} 
        showActions={false}
        onCopy={mockOnCopy}
      />
    )
    
    expect(screen.queryByLabelText('Copy message to clipboard')).not.toBeInTheDocument()
  })

  it('does not render message actions when no handlers are provided', () => {
    render(<ChatMessage message={mockAssistantMessage} showActions={true} />)
    
    expect(screen.queryByLabelText('Copy message to clipboard')).not.toBeInTheDocument()
  })
})