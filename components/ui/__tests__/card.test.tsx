import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'

describe('Card Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Card>Card content</Card>)
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
    })

    it('renders with custom content', () => {
      render(<Card>Custom card content</Card>)
      expect(screen.getByText('Custom card content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Card className="custom-class">Card</Card>)
      const card = screen.getByText('Card')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('renders default variant by default', () => {
      render(<Card>Default card</Card>)
      const card = screen.getByText('Default card')
      expect(card).toHaveClass('border-border', 'bg-card')
    })

    it('renders elevated variant', () => {
      render(<Card variant="elevated">Elevated card</Card>)
      const card = screen.getByText('Elevated card')
      expect(card).toHaveClass('shadow-md')
    })

    it('renders outlined variant', () => {
      render(<Card variant="outlined">Outlined card</Card>)
      const card = screen.getByText('Outlined card')
      expect(card).toHaveClass('border-2', 'bg-transparent')
    })

    it('renders ghost variant', () => {
      render(<Card variant="ghost">Ghost card</Card>)
      const card = screen.getByText('Ghost card')
      expect(card).toHaveClass('border-transparent', 'bg-transparent')
    })

    it('renders interactive variant', () => {
      render(<Card variant="interactive">Interactive card</Card>)
      const card = screen.getByText('Interactive card')
      expect(card).toHaveClass('cursor-pointer')
    })
  })

  describe('Padding', () => {
    it('renders medium padding by default', () => {
      render(<Card>Medium padding</Card>)
      const card = screen.getByText('Medium padding')
      expect(card).toHaveClass('p-4')
    })

    it('renders different padding sizes', () => {
      const { rerender } = render(<Card padding="none">No padding</Card>)
      expect(screen.getByText('No padding')).toHaveClass('p-0')

      rerender(<Card padding="xs">XS padding</Card>)
      expect(screen.getByText('XS padding')).toHaveClass('p-2')

      rerender(<Card padding="sm">Small padding</Card>)
      expect(screen.getByText('Small padding')).toHaveClass('p-3')

      rerender(<Card padding="lg">Large padding</Card>)
      expect(screen.getByText('Large padding')).toHaveClass('p-6')

      rerender(<Card padding="xl">XL padding</Card>)
      expect(screen.getByText('XL padding')).toHaveClass('p-8')
    })
  })

  describe('Sizes', () => {
    it('renders auto size by default', () => {
      render(<Card>Auto size</Card>)
      const card = screen.getByText('Auto size')
      expect(card).toHaveClass('w-auto')
    })

    it('renders different sizes', () => {
      const { rerender } = render(<Card size="sm">Small card</Card>)
      expect(screen.getByText('Small card')).toHaveClass('max-w-sm')

      rerender(<Card size="md">Medium card</Card>)
      expect(screen.getByText('Medium card')).toHaveClass('max-w-md')

      rerender(<Card size="lg">Large card</Card>)
      expect(screen.getByText('Large card')).toHaveClass('max-w-lg')

      rerender(<Card size="xl">XL card</Card>)
      expect(screen.getByText('XL card')).toHaveClass('max-w-xl')

      rerender(<Card size="full">Full card</Card>)
      expect(screen.getByText('Full card')).toHaveClass('w-full')
    })
  })

  describe('Interactivity', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Card onClick={handleClick}>Clickable card</Card>)
      
      const card = screen.getByText('Clickable card')
      expect(card).toHaveAttribute('role', 'button')
      expect(card).toHaveAttribute('tabIndex', '0')
      
      await user.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Card onClick={handleClick}>Keyboard accessible card</Card>)
      
      const card = screen.getByText('Keyboard accessible card')
      card.focus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    it('supports custom tabIndex', () => {
      render(<Card onClick={() => {}} tabIndex={-1}>Custom tabIndex</Card>)
      const card = screen.getByText('Custom tabIndex')
      expect(card).toHaveAttribute('tabIndex', '-1')
    })

    it('supports custom role', () => {
      render(<Card onClick={() => {}} role="article">Custom role</Card>)
      const card = screen.getByText('Custom role')
      expect(card).toHaveAttribute('role', 'article')
    })

    it('supports aria-label', () => {
      render(<Card aria-label="Custom label">Labeled card</Card>)
      const card = screen.getByText('Labeled card')
      expect(card).toHaveAttribute('aria-label', 'Custom label')
    })

    it('does not add interactive attributes when not clickable', () => {
      render(<Card>Non-clickable card</Card>)
      const card = screen.getByText('Non-clickable card')
      expect(card).not.toHaveAttribute('role', 'button')
      expect(card).not.toHaveAttribute('tabIndex')
    })
  })

  describe('Forward Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Card with ref</Card>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toBe(screen.getByText('Card with ref'))
    })
  })
})

describe('CardHeader Component', () => {
  it('renders with default props', () => {
    render(<CardHeader>Header content</CardHeader>)
    const header = screen.getByText('Header content')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5')
  })

  it('renders as different elements', () => {
    const { rerender } = render(<CardHeader as="header">Header element</CardHeader>)
    expect(screen.getByRole('banner')).toBeInTheDocument()

    rerender(<CardHeader as="div">Div element</CardHeader>)
    expect(screen.getByText('Div element')).toBeInTheDocument()
  })

  it('applies different padding', () => {
    render(<CardHeader padding="lg">Large padding header</CardHeader>)
    const header = screen.getByText('Large padding header')
    expect(header).toHaveClass('p-6')
  })
})

describe('CardTitle Component', () => {
  it('renders with default props', () => {
    render(<CardTitle>Card Title</CardTitle>)
    const title = screen.getByText('Card Title')
    expect(title).toBeInTheDocument()
    expect(title.tagName).toBe('H3')
    expect(title).toHaveClass('text-lg', 'font-semibold')
  })

  it('renders as different heading levels', () => {
    const { rerender } = render(<CardTitle as="h1">H1 Title</CardTitle>)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    rerender(<CardTitle as="h2">H2 Title</CardTitle>)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()

    rerender(<CardTitle as="div">Div Title</CardTitle>)
    const divTitle = screen.getByText('Div Title')
    expect(divTitle.tagName).toBe('DIV')
  })
})

describe('CardDescription Component', () => {
  it('renders with default props', () => {
    render(<CardDescription>Card description</CardDescription>)
    const description = screen.getByText('Card description')
    expect(description).toBeInTheDocument()
    expect(description.tagName).toBe('P')
    expect(description).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('renders as different elements', () => {
    const { rerender } = render(<CardDescription as="div">Div description</CardDescription>)
    const divDesc = screen.getByText('Div description')
    expect(divDesc.tagName).toBe('DIV')

    rerender(<CardDescription as="span">Span description</CardDescription>)
    const spanDesc = screen.getByText('Span description')
    expect(spanDesc.tagName).toBe('SPAN')
  })
})

describe('CardContent Component', () => {
  it('renders with default props', () => {
    render(<CardContent>Content area</CardContent>)
    const content = screen.getByText('Content area')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('p-4')
  })

  it('applies different padding', () => {
    render(<CardContent padding="none">No padding content</CardContent>)
    const content = screen.getByText('No padding content')
    expect(content).toHaveClass('p-0')
  })
})

describe('CardFooter Component', () => {
  it('renders with default props', () => {
    render(<CardFooter>Footer content</CardFooter>)
    const footer = screen.getByText('Footer content')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('flex', 'items-center', 'justify-start')
  })

  it('renders as different elements', () => {
    render(<CardFooter as="footer">Footer element</CardFooter>)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('applies different justification', () => {
    const { rerender } = render(<CardFooter justify="center">Center footer</CardFooter>)
    expect(screen.getByText('Center footer')).toHaveClass('justify-center')

    rerender(<CardFooter justify="end">End footer</CardFooter>)
    expect(screen.getByText('End footer')).toHaveClass('justify-end')

    rerender(<CardFooter justify="between">Between footer</CardFooter>)
    expect(screen.getByText('Between footer')).toHaveClass('justify-between')
  })
})

describe('Card Composition', () => {
  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>This is a test card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter justify="end">
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('This is a test card description')).toBeInTheDocument()
    expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('works with interactive cards', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(
      <Card onClick={handleClick} aria-label="Interactive message card">
        <CardHeader>
          <CardTitle>Message</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Click me!</p>
        </CardContent>
      </Card>
    )

    const card = screen.getByLabelText('Interactive message card')
    await user.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})