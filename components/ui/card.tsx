import React from 'react'
import { type CardProps, type BaseComponentProps } from '../../lib/types/ui'
import { 
  cardVariants, 
  cardHeaderVariants, 
  cardContentVariants, 
  cardFooterVariants,
  type CardHeaderVariants,
  type CardContentVariants,
  type CardFooterVariants
} from '../../lib/variants/card'
import { cn } from '../../lib/utils'

// Main Card component
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md', 
    size = 'auto',
    children, 
    onClick,
    onKeyDown,
    tabIndex,
    role,
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    const isInteractive = Boolean(onClick) || variant === 'interactive'
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onClick?.(e as React.MouseEvent<HTMLDivElement>)
      }
      onKeyDown?.(e)
    }
    
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, size }), className)}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
        role={isInteractive ? (role ?? 'button') : role}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header component
interface CardHeaderProps extends BaseComponentProps, CardHeaderVariants {
  as?: 'div' | 'header'
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding = 'md', as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(cardHeaderVariants({ padding }), className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// Card Title component
interface CardTitleProps extends BaseComponentProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight text-card-foreground",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CardTitle.displayName = 'CardTitle'

// Card Description component
interface CardDescriptionProps extends BaseComponentProps {
  as?: 'p' | 'div' | 'span'
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, as: Component = 'p', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "text-sm text-muted-foreground leading-relaxed",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CardDescription.displayName = 'CardDescription'

// Card Content component
interface CardContentProps extends BaseComponentProps, CardContentVariants {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardContentVariants({ padding }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

// Card Footer component
interface CardFooterProps extends BaseComponentProps, CardFooterVariants {
  as?: 'div' | 'footer'
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ 
    className, 
    padding = 'md', 
    justify = 'start',
    as: Component = 'div', 
    children, 
    ...props 
  }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(cardFooterVariants({ padding, justify }), className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CardFooter.displayName = 'CardFooter'

// Export all components
export default Card
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter }