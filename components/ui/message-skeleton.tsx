'use client'

import React, { useEffect, useState } from 'react'
import { motion, type Variants, cubicBezier, easeOut } from 'framer-motion'
import { cn } from '../../lib/utils'
import Skeleton from './skeleton'

interface MessageSkeletonProps {
  isUser?: boolean
  className?: string
  showAvatar?: boolean
  lines?: number
}

const skeletonVariants: Variants = {
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
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
      staggerChildren: 0.1
    }
  }
}

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: easeOut
    }
  }
}

const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
  isUser = false,
  className,
  showAvatar = true,
  lines = 2
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  if (!isMounted) {
    // Return a simple skeleton without animations during SSR
    return (
      <div className={cn(
        "group relative flex w-full gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start",
        className
      )}>
        {!isUser && showAvatar && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        )}
        <div className={cn(
          "flex flex-col gap-2 max-w-[80%] sm:max-w-[70%]",
          isUser ? "items-end" : "items-start"
        )}>
          <div className={cn(
            "relative px-4 py-3 rounded-2xl",
            "border border-gray-200 dark:border-gray-700",
            isUser 
              ? "bg-gray-100 dark:bg-gray-800 rounded-br-md"
              : "bg-white dark:bg-gray-800 rounded-bl-md"
          )}>
            <div className="space-y-2">
              {Array.from({ length: lines }).map((_, i) => (
                <div 
                  key={i}
                  className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full"
                  style={{ width: i === lines - 1 ? '75%' : '100%' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "group relative flex w-full gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {/* Avatar for non-user messages */}
      {!isUser && showAvatar && (
        <motion.div variants={contentVariants}>
          <Skeleton 
            variant="circular" 
            width={32} 
            height={32}
            className="flex-shrink-0"
          />
        </motion.div>
      )}

      {/* Message Content Container */}
      <div className={cn(
        "flex flex-col gap-2 max-w-[80%] sm:max-w-[70%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble Skeleton */}
        <motion.div 
          variants={contentVariants}
          className={cn(
            "relative px-4 py-3 rounded-2xl",
            "border border-gray-200 dark:border-gray-700",
            // User message styling
            isUser && [
              "bg-gray-100 dark:bg-gray-800",
              "rounded-br-md" // Sharp corner on bottom right for user messages
            ],
            // Assistant message styling
            !isUser && [
              "bg-white dark:bg-gray-800",
              "rounded-bl-md" // Sharp corner on bottom left for assistant messages
            ]
          )}
        >
          {/* Message Content Skeleton */}
          <div className="space-y-2">
            <Skeleton 
              variant="text" 
              lines={lines}
              className="h-4"
            />
          </div>
        </motion.div>

        {/* Timestamp Skeleton */}
        <motion.div 
          variants={contentVariants}
          className={cn(
            "flex items-center gap-2",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <Skeleton 
            variant="text" 
            width={60} 
            height={12}
            className="h-3"
          />
        </motion.div>
      </div>

      {/* User Avatar for user messages */}
      {isUser && showAvatar && (
        <motion.div variants={contentVariants}>
          <Skeleton 
            variant="circular" 
            width={32} 
            height={32}
            className="flex-shrink-0"
          />
        </motion.div>
      )}
    </motion.div>
  )
}

export default MessageSkeleton