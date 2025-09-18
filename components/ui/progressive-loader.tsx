import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, type Variants, easeOut, easeIn, cubicBezier } from 'framer-motion'
import { cn } from '../../lib/utils'
import Skeleton from './skeleton'

interface ProgressiveLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  skeletonVariant?: 'text' | 'message' | 'custom'
  skeletonLines?: number
  className?: string
  delay?: number
}

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easeOut
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: easeIn
    }
  }
}

const slideVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94)
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: cubicBezier(0.55, 0.06, 0.68, 0.19)
    }
  }
}

const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  isLoading,
  children,
  skeletonVariant = 'text',
  skeletonLines = 3,
  className,
  delay = 0
}) => {
  const [showContent, setShowContent] = useState(!isLoading)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [isLoading, delay])

  const renderSkeleton = () => {
    switch (skeletonVariant) {
      case 'message':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton variant="circular" width={32} height={32} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" lines={2} />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="flex-1 max-w-xs space-y-2">
                <Skeleton variant="text" lines={1} />
              </div>
              <Skeleton variant="circular" width={32} height={32} />
            </div>
          </div>
        )
      case 'text':
        return <Skeleton variant="text" lines={skeletonLines} />
      case 'custom':
        return children
      default:
        return <Skeleton variant="text" lines={skeletonLines} />
    }
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {isLoading || !showContent ? (
          <motion.div
            key="skeleton"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderSkeleton()}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProgressiveLoader