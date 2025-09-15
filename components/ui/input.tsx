import React, { useId, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { type InputProps } from '../../lib/types/ui'
import { inputVariants, inputLabelVariants, inputHelperVariants, inputIconVariants } from '../../lib/variants/input'
import { cn } from '../../lib/utils'

// Success and Error icons
const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

const ExclamationIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
)

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon,
    required = false,
    disabled = false,
    id: providedId,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const generatedId = useId()
    const id = providedId || generatedId
    const helperId = `${id}-helper`
    const errorId = `${id}-error`
    
    // Determine state based on error and success
    const hasError = Boolean(error)
    const hasSuccess = !hasError && Boolean(props.value) && !isFocused
    const state = hasError ? 'error' : hasSuccess ? 'success' : 'default'
    
    // Calculate padding based on icons
    const leftPadding = leftIcon ? (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-12' : 'pl-10') : ''
    const rightPadding = rightIcon || hasError || hasSuccess ? (size === 'sm' ? 'pr-8' : size === 'lg' ? 'pr-12' : 'pr-10') : ''
    
    // Determine which right icon to show
    const displayRightIcon = rightIcon || (hasError ? <ExclamationIcon /> : hasSuccess ? <CheckIcon /> : null)
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id}
            className={cn(inputLabelVariants({ state, required }), "mb-2 block")}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div 
              className={cn(inputIconVariants({ position: 'left', state, size }))}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              inputVariants({ variant, size, state }),
              leftPadding,
              rightPadding,
              className
            )}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? 'true' : ariaInvalid}
            aria-describedby={cn(
              (error || helperText) && helperId,
              error && errorId,
              ariaDescribedBy
            ).trim() || undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {displayRightIcon && (
            <div 
              className={cn(inputIconVariants({ position: 'right', state, size }))}
              aria-hidden="true"
            >
              {displayRightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <div 
            id={helperId}
            className={cn(inputHelperVariants({ state }))}
            role={error ? 'alert' : 'status'}
            aria-live={error ? 'assertive' : 'polite'}
          >
            {error && (
              <span id={errorId} className="flex items-center gap-1">
                <ExclamationIcon />
                {error}
              </span>
            )}
            {!error && helperText && (
              <span>{helperText}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input