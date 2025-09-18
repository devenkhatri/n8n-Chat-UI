import React from 'react'
import { cn } from '../../lib/utils'
import { useIsMobile } from '../../lib/utils/mobile'

// Container component with responsive padding and max-width
interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className, 
  size = 'xl' 
}) => {
  const isMobile = useIsMobile()
  
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none'
  }

  return (
    <div className={cn(
      'mx-auto w-full',
      // Mobile-optimized padding
      isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}

// Main layout wrapper
interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      'min-h-screen flex flex-col bg-background text-foreground',
      className
    )}>
      {children}
    </div>
  )
}

// Content area with responsive spacing
interface ContentAreaProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export const ContentArea: React.FC<ContentAreaProps> = ({ 
  children, 
  className,
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'py-4 sm:py-6',
    md: 'py-6 sm:py-8 lg:py-12',
    lg: 'py-8 sm:py-12 lg:py-16',
    xl: 'py-12 sm:py-16 lg:py-20'
  }

  return (
    <main className={cn(
      'flex-1 w-full',
      paddingClasses[padding],
      className
    )}>
      {children}
    </main>
  )
}

// Responsive grid system
interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  className,
  cols = { default: 1 },
  gap = 'md'
}) => {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  }

  const getGridCols = () => {
    const classes = []
    
    if (cols.default) {
      classes.push(`grid-cols-${cols.default}`)
    }
    if (cols.sm) {
      classes.push(`sm:grid-cols-${cols.sm}`)
    }
    if (cols.md) {
      classes.push(`md:grid-cols-${cols.md}`)
    }
    if (cols.lg) {
      classes.push(`lg:grid-cols-${cols.lg}`)
    }
    if (cols.xl) {
      classes.push(`xl:grid-cols-${cols.xl}`)
    }
    
    return classes.join(' ')
  }

  return (
    <div className={cn(
      'grid',
      getGridCols(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Flexible layout component
interface FlexProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: {
    sm?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>
    md?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>
    lg?: Partial<Pick<FlexProps, 'direction' | 'align' | 'justify'>>
  }
}

export const Flex: React.FC<FlexProps> = ({ 
  children, 
  className,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'none',
  responsive = {}
}) => {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  }

  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const getResponsiveClasses = () => {
    const classes: string[] = []
    
    Object.entries(responsive).forEach(([breakpoint, props]) => {
      if (props.direction) {
        classes.push(`${breakpoint}:${directionClasses[props.direction]}`)
      }
      if (props.align) {
        classes.push(`${breakpoint}:${alignClasses[props.align]}`)
      }
      if (props.justify) {
        classes.push(`${breakpoint}:${justifyClasses[props.justify]}`)
      }
    })
    
    return classes.join(' ')
  }

  return (
    <div className={cn(
      'flex',
      directionClasses[direction],
      alignClasses[align],
      justifyClasses[justify],
      wrap && 'flex-wrap',
      gapClasses[gap],
      getResponsiveClasses(),
      className
    )}>
      {children}
    </div>
  )
}

// Stack component for vertical layouts
interface StackProps {
  children: React.ReactNode
  className?: string
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export const Stack: React.FC<StackProps> = ({ 
  children, 
  className,
  spacing = 'md',
  align = 'stretch'
}) => {
  const spacingClasses = {
    none: 'space-y-0',
    xs: 'space-y-2',
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
    xl: 'space-y-12'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  return (
    <div className={cn(
      'flex flex-col',
      spacingClasses[spacing],
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  )
}

// Responsive section component
interface SectionProps {
  children: React.ReactNode
  className?: string
  background?: 'default' | 'muted' | 'accent'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  className,
  background = 'default',
  padding = 'lg',
  containerSize = 'xl'
}) => {
  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted',
    accent: 'bg-accent'
  }

  const paddingClasses = {
    none: '',
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-20 lg:py-24',
    xl: 'py-20 sm:py-24 lg:py-32'
  }

  return (
    <section className={cn(
      'w-full',
      backgroundClasses[background],
      paddingClasses[padding],
      className
    )}>
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  )
}

// Responsive breakpoint utilities
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Hook for responsive behavior
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof breakpoints | 'xs'>('xs')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width >= 1536) setBreakpoint('2xl')
      else if (width >= 1280) setBreakpoint('xl')
      else if (width >= 1024) setBreakpoint('lg')
      else if (width >= 768) setBreakpoint('md')
      else if (width >= 640) setBreakpoint('sm')
      else setBreakpoint('xs')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

// Export all components as default
const Layout = {
  Container,
  MainLayout,
  ContentArea,
  Grid,
  Flex,
  Stack,
  Section,
  breakpoints,
  useBreakpoint
}

export default Layout