import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Toast from '../toast'
import { ToastProvider, useToastActions } from '../../../providers/toast-provider'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('Toast', () => {
  it('renders toast with title and description', () => {
    render(
      <Toast
        type="success"
        title="Success!"
        description="Operation completed successfully"
        visible={true}
      />
    )

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
  })

  it('renders different toast types with correct styling', () => {
    const { rerender } = render(
      <Toast type="success" title="Success" visible={true} />
    )
    expect(screen.getByRole('alert')).toHaveClass('bg-success/10')

    rerender(<Toast type="error" title="Error" visible={true} />)
    expect(screen.getByRole('alert')).toHaveClass('bg-destructive/10')

    rerender(<Toast type="warning" title="Warning" visible={true} />)
    expect(screen.getByRole('alert')).toHaveClass('bg-warning/10')

    rerender(<Toast type="info" title="Info" visible={true} />)
    expect(screen.getByRole('alert')).toHaveClass('bg-info/10')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    
    render(
      <Toast
        title="Test Toast"
        visible={true}
        onClose={onClose}
      />
    )

    fireEvent.click(screen.getByLabelText('Close notification'))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders action button when provided', () => {
    const actionFn = jest.fn()
    
    render(
      <Toast
        title="Test Toast"
        visible={true}
        action={{
          label: 'Retry',
          onClick: actionFn
        }}
      />
    )

    const actionButton = screen.getByText('Retry')
    expect(actionButton).toBeInTheDocument()
    
    fireEvent.click(actionButton)
    expect(actionFn).toHaveBeenCalled()
  })

  it('auto-closes after duration', async () => {
    const onClose = jest.fn()
    
    render(
      <Toast
        title="Test Toast"
        visible={true}
        duration={100}
        onClose={onClose}
      />
    )

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    }, { timeout: 200 })
  })

  it('does not auto-close when persistent', async () => {
    const onClose = jest.fn()
    
    render(
      <Toast
        title="Test Toast"
        visible={true}
        duration={100}
        persistent={true}
        onClose={onClose}
      />
    )

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('pauses auto-close on mouse enter', async () => {
    const onClose = jest.fn()
    
    render(
      <Toast
        title="Test Toast"
        visible={true}
        duration={100}
        onClose={onClose}
      />
    )

    const toast = screen.getByRole('alert')
    fireEvent.mouseEnter(toast)

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    render(
      <Toast
        title="Test Toast"
        visible={true}
      />
    )

    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('aria-live', 'polite')
    expect(toast).toHaveAttribute('aria-atomic', 'true')
  })
})

// Test component for ToastProvider
function TestToastComponent() {
  const { success, error, warning, info } = useToastActions()

  return (
    <div>
      <button onClick={() => success('Success!', 'It worked!')}>Success</button>
      <button onClick={() => error('Error!', 'Something went wrong!')}>Error</button>
      <button onClick={() => warning('Warning!', 'Be careful!')}>Warning</button>
      <button onClick={() => info('Info!', 'Just so you know!')}>Info</button>
    </div>
  )
}

describe('ToastProvider', () => {
  it('provides toast context to children', () => {
    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    )

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('creates toasts when actions are called', () => {
    render(
      <ToastProvider>
        <TestToastComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Success'))
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('It worked!')).toBeInTheDocument()
  })

  it('limits number of toasts', () => {
    render(
      <ToastProvider maxToasts={2}>
        <TestToastComponent />
      </ToastProvider>
    )

    // Add 3 toasts
    fireEvent.click(screen.getByText('Success'))
    fireEvent.click(screen.getByText('Error'))
    fireEvent.click(screen.getByText('Warning'))

    // Only 2 should be visible (newest ones)
    expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(screen.getByText('Warning!')).toBeInTheDocument()
  })
})