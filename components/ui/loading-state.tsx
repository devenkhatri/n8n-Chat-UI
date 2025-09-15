import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import Skeleton from './skeleton'
import MessageSkeleton from './message-skeleton'

interface LoadingStateProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'message-skeleton'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
  visible?: boolean
  messageCount?: number
}

// Spinner variants
const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Dots variants
const dotsContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
}

const dotVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Pulse variants
const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  size = 'md',
  className,
  message,
  visible = true,
  messageCount = 2
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const renderSpinner = () => (
    <motion.div
      variants={spinnerVariants}
      animate="animate"
      className={cn(
        "border-2 border-gray-300 border-t-primary-500 rounded-full",
        sizeClasses[size],
        className
      )}
    />
  )

  const renderDots = () => (
    <motion.div
      variants={dotsContainerVariants}
      animate="animate"
      className={cn("flex space-x-1", className)}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          className={cn(
            "bg-primary-500 rounded-full",
            dotSizeClasses[size]
          )}
        />
      ))}
    </motion.div>
  )

  const renderPulse = () => (
    <motion.div
      variants={pulseVariants}
      animate="animate"
      className={cn(
        "bg-primary-500 rounded-full",
        sizeClasses[size],
        className
      )}
    />
  )

  const renderSkeleton = () => (
    <div className={cn("space-y-3", className)}>
      <Skeleton variant="text" lines={3} />
      <div className="flex space-x-2">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
    </div>
  )

  const renderMessageSkeleton = () => (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: messageCount }).map((_, index) => (
        <MessageSkeleton
          key={index}
          isUser={index % 2 === 0}
          lines={Math.floor(Math.random() * 3) + 1}
        />
      ))}
    </div>
  )

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'skeleton':
        return renderSkeleton()
      case 'message-skeleton':
        return renderMessageSkeleton()
      default:
        return renderSpinner()
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center space-y-3"
        >
          {renderContent()}
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground text-center"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingState