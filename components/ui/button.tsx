import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { type ButtonProps } from '../../lib/types/ui'
import { buttonVariants } from '../../lib/variants/button'
import { cn } from '../../lib/utils'

// Animation variants for button interactions
const buttonAnimationVariants: Variants = {
  idle: { 
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeOut" }
  },
  loading: {
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" }
  }
}

// Ripple effect variants
const rippleVariants: Variants = {
  initial: { 
    scale: 0, 
    opacity: 0.6 
  },
  animate: { 
    scale: 4, 
    opacity: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    }
  }
}

// Loading spinner with enhanced animation
const LoadingSpinner = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const spinnerSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }[size]

  return (
    <motion.div 
      className={cn(
        "rounded-full border-2 border-current border-t-transparent",
        spinnerSize
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      aria-hidden="true"
    />
  )
}

// Ripple effect component
const RippleEffect: React.FC<{ 
  x: number; 
  y: number; 
  onComplete: () => void 
}> = ({ x, y, onComplete }) => (
  <motion.span
    className="absolute rounded-full bg-current pointer-events-none"
    style={{
      left: x - 10,
      top: y - 10,
      width: 20,
      height: 20,
    }}
    variants={rippleVariants}
    initial="initial"
    animate="animate"
    onAnimationComplete={onComplete}
  />
)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false, 
    icon, 
    children, 
    type = 'button',
    'aria-label': ariaLabel,
    onClick,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])
    const [rippleId, setRippleId] = React.useState(0)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return

      // Create ripple effect
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      const newRipple = { id: rippleId, x, y }
      setRipples(prev => [...prev, newRipple])
      setRippleId(prev => prev + 1)

      // Call original onClick
      onClick?.(event)
    }

    const removeRipple = (id: number) => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn(
          buttonVariants({ variant, size }), 
          "relative overflow-hidden",
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={loading ? `Loading... ${ariaLabel || ''}`.trim() : ariaLabel}
        variants={buttonAnimationVariants}
        initial="idle"
        animate={loading ? "loading" : "idle"}
        whileHover={!isDisabled ? "hover" : "idle"}
        whileTap={!isDisabled ? "tap" : "idle"}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <RippleEffect
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            onComplete={() => removeRipple(ripple.id)}
          />
        ))}

        {/* Button content */}
        <motion.div
          className="relative z-10 flex items-center justify-center gap-2"
          animate={{
            opacity: loading ? 0.7 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <>
              <LoadingSpinner size={size} />
              {children && <span>{children}</span>}
            </>
          ) : (
            <>
              {icon && (
                <motion.span 
                  className="flex-shrink-0" 
                  aria-hidden="true"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  {icon}
                </motion.span>
              )}
              <motion.span
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: icon ? 0.15 : 0 }}
              >
                {children}
              </motion.span>
            </>
          )}
        </motion.div>
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button