import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import Skeleton from './skeleton'

interface MessageSkeletonProps {
  isUser?: boolean
  className?: string
  showAvatar?: boolean
  lines?: number
}

const skeletonVariants = {
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
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  }
}

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
  isUser = false,
  className,
  showAvatar = true,
  lines = 2
}) => {
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