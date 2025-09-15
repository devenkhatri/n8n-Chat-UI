import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
  animated?: boolean
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  animated = true
}) => {
  const baseClasses = cn(
    "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
    "bg-[length:200px_100%] bg-no-repeat",
    {
      'rounded-full': variant === 'circular',
      'rounded-md': variant === 'rectangular',
      'rounded-sm h-4': variant === 'text',
      'animate-pulse': animated
    },
    className
  )

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined)
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, {
              'w-3/4': index === lines - 1 && lines > 1, // Last line is shorter
            })}
            style={index === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={baseClasses}
      style={style}
    />
  )
}

export default Skeleton