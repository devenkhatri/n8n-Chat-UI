import React from 'react'
import { motion, AnimatePresence, type Variants, easeInOut, easeOut, easeIn } from 'framer-motion'
import { type TypingIndicatorProps } from '../../lib/types/ui'
import { cn } from '../../lib/utils'

const DotsIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const dotVariants: Variants = {
    initial: { y: 0 },
    animate: { y: -8 },
  }

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 0.6,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn("flex items-center gap-1", className)}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
        />
      ))}
    </motion.div>
  )
}

const PulseIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const pulseVariants: Variants = {
    initial: { scale: 1, opacity: 0.7 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: easeInOut,
      },
    },
  }

  return (
    <motion.div
      variants={pulseVariants}
      initial="initial"
      animate="animate"
      className={cn(
        "w-3 h-3 bg-primary-500 dark:bg-primary-400 rounded-full",
        className
      )}
    />
  )
}

const WaveIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const waveVariants: Variants = {
    initial: { scaleY: 1 },
    animate: { scaleY: [1, 2, 1] },
  }

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        repeat: Infinity,
        duration: 1.2,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn("flex items-center gap-1", className)}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          variants={waveVariants}
          className="w-1 h-4 bg-gradient-to-t from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-300 rounded-full origin-bottom"
        />
      ))}
    </motion.div>
  )
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  visible, 
  variant = 'dots', 
  message = 'AI is typing...',
  className,
  children 
}) => {
  const containerVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: easeOut
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: easeIn
      }
    }
  }

  const renderIndicator = () => {
    switch (variant) {
      case 'pulse':
        return <PulseIndicator />
      case 'wave':
        return <WaveIndicator />
      case 'dots':
      default:
        return <DotsIndicator />
    }
  }

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            className
          )}
          role="status"
          aria-live="polite"
          aria-label={message}
        >
          {/* Avatar for AI */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 flex items-center justify-center text-sm font-medium">
            AI
          </div>

          {/* Typing Indicator Container */}
          <div className="flex flex-col gap-1">
            {/* Message Bubble */}
            <div className={cn(
              "relative px-4 py-3 rounded-2xl rounded-bl-md",
              "bg-white text-gray-900 border border-gray-200 shadow-sm",
              "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
              "min-w-[80px] flex items-center justify-center"
            )}>
              {renderIndicator()}
            </div>

            {/* Message Text */}
            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-gray-500 dark:text-gray-400 ml-2"
              >
                {message}
              </motion.div>
            )}
          </div>

          {/* Custom children content */}
          {children && (
            <div className="ml-auto">
              {children}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TypingIndicator