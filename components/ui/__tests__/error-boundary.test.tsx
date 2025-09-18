import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ErrorBoundary from '../error-boundary'
import { ErrorMessage, NetworkErrorFallback, APIErrorFallback, GenericErrorFallback } from '../error-message'

// Mock the error logging utility
jest.mock('../../../lib/utils/error-logging', () => ({
  logErrorWithInfo: jest.fn(),
  logError: jest.fn(),
}))

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('uses custom fallback component when provided', () => {
    const CustomFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
      <div>
        <span>Custom error: {error.message}</span>
        <button onClick={retry}>Custom retry</button>
      </div>
    )

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument()
    expect(screen.getByText('Custom retry')).toBeInTheDocument()
  })

  it('resets error state when retry is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()

    // Click retry
    fireEvent.click(screen.getByText('Try Again'))

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('shows persistent error UI after max retries', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Simulate multiple retries
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText('Try Again'))
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
    }

    expect(screen.getByText('Persistent Error')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })
})

describe('ErrorMessage', () => {
  it('renders network error message', () => {
    render(
      <ErrorMessage
        type="network"
        message="Connection failed"
        actions={[
          { label: 'Retry', action: jest.fn(), variant: 'primary' }
        ]}
      />
    )

    expect(screen.getByText('Connection Problem')).toBeInTheDocument()
    expect(screen.getByText('Connection failed')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('renders API error message', () => {
    render(<ErrorMessage type="api" message="Server error" />)

    expect(screen.getByText('Service Error')).toBeInTheDocument()
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('renders validation error message', () => {
    render(<ErrorMessage type="validation" message="Invalid input" />)

    expect(screen.getByText('Invalid Input')).toBeInTheDocument()
    expect(screen.getByText('Invalid input')).toBeInTheDocument()
  })

  it('renders generic error message', () => {
    render(<ErrorMessage type="generic" message="Something went wrong" />)

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('executes action when button is clicked', () => {
    const mockAction = jest.fn()
    
    render(
      <ErrorMessage
        type="generic"
        message="Test error"
        actions={[
          { label: 'Test Action', action: mockAction, variant: 'primary' }
        ]}
      />
    )

    fireEvent.click(screen.getByText('Test Action'))
    expect(mockAction).toHaveBeenCalled()
  })
})

describe('Error Fallback Components', () => {
  const mockError = new Error('Test error')
  const mockRetry = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders NetworkErrorFallback', () => {
    render(<NetworkErrorFallback error={mockError} retry={mockRetry} />)

    expect(screen.getByText('Connection Problem')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Go Offline')).toBeInTheDocument()
  })

  it('renders APIErrorFallback', () => {
    render(<APIErrorFallback error={mockError} retry={mockRetry} />)

    expect(screen.getByText('Service Error')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })

  it('renders APIErrorFallback with rate limit message', () => {
    const rateLimitError = new Error('Rate limit exceeded')
    render(<APIErrorFallback error={rateLimitError} retry={mockRetry} />)

    expect(screen.getByText(/rate limit/i)).toBeInTheDocument()
    expect(screen.getByText('Wait and Retry')).toBeInTheDocument()
  })

  it('renders GenericErrorFallback', () => {
    render(<GenericErrorFallback error={mockError} retry={mockRetry} />)

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })

  it('calls retry function when retry button is clicked', () => {
    render(<GenericErrorFallback error={mockError} retry={mockRetry} />)

    fireEvent.click(screen.getByText('Try Again'))
    expect(mockRetry).toHaveBeenCalled()
  })
})