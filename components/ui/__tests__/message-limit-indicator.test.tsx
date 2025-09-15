import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock the dependencies
jest.mock('../button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
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
  ExclamationTriangleIcon: () => <span>!</span>,
  SparklesIcon: () => <span>✨</span>,
  InformationCircleIcon: () => <span>ℹ</span>
}))

import { MessageLimitIndicator } from '../message-limit-indicator'

describe('MessageLimitIndicator', () => {
  const defaultProps = {
    remaining: 3,
    total: 5,
    onUpgrade: jest.fn(),
    onReset: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with normal status', () => {
    render(<MessageLimitIndicator {...defaultProps} />)
    
    expect(screen.getByText('3 of 5 messages remaining')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('shows low status when remaining is 20% or less', () => {
    render(<MessageLimitIndicator {...defaultProps} remaining={1} />)
    
    expect(screen.getByText('1 message remaining')).toBeInTheDocument()
    expect(screen.getByText('Running low on messages')).toBeInTheDocument()
  })

  it('shows very low status when remaining is 10% or less', () => {
    render(<MessageLimitIndicator {...defaultProps} remaining={0} total={10} />)
    
    expect(screen.getByText('No messages remaining')).toBeInTheDocument()
    expect(screen.getByText('Message limit reached')).toBeInTheDocument()
  })

  it('shows empty status when no messages remaining', () => {
    render(<MessageLimitIndicator {...defaultProps} remaining={0} />)
    
    expect(screen.getByText('No messages remaining')).toBeInTheDocument()
    expect(screen.getByText('Message limit reached')).toBeInTheDocument()
    expect(screen.getByText('You\'ve used all your messages for this session. Reset to continue or upgrade for unlimited messages.')).toBeInTheDocument()
  })

  it('calls onUpgrade when upgrade button is clicked', () => {
    render(<MessageLimitIndicator {...defaultProps} remaining={0} />)
    
    const upgradeButton = screen.getByText('Upgrade')
    fireEvent.click(upgradeButton)
    
    expect(defaultProps.onUpgrade).toHaveBeenCalledTimes(1)
  })

  it('calls onReset when reset button is clicked', () => {
    render(<MessageLimitIndicator {...defaultProps} remaining={0} />)
    
    const resetButton = screen.getByText('Reset Session')
    fireEvent.click(resetButton)
    
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1)
  })

  it('hides upgrade button when showUpgrade is false', () => {
    render(<MessageLimitIndicator {...defaultProps} remaining={0} showUpgrade={false} />)
    
    expect(screen.queryByText('Upgrade')).not.toBeInTheDocument()
  })

  it('does not show action card when not low or empty', () => {
    render(<MessageLimitIndicator {...defaultProps} remaining={4} />)
    
    expect(screen.queryByText('Running low on messages')).not.toBeInTheDocument()
    expect(screen.queryByText('Message limit reached')).not.toBeInTheDocument()
  })

  it('shows correct progress bar width', () => {
    const { container } = render(<MessageLimitIndicator {...defaultProps} remaining={2} />)
    
    const progressBar = container.querySelector('[style*="width: 40%"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('shows minimum 2% width for empty state', () => {
    const { container } = render(<MessageLimitIndicator {...defaultProps} remaining={0} />)
    
    const progressBar = container.querySelector('[style*="width: 2%"]')
    expect(progressBar).toBeInTheDocument()
  })
})