import React from 'react'
import { motion } from 'framer-motion'
import { type ChatMessageProps } from '../../lib/types/ui'
import { cn } from '../../lib/utils'
import MessageActions from './message-actions'

const messageVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth entrance
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -30,
    scale: 0.9,
    filter: "blur(4px)",
    transition: {
      duration: 0.3,
      ease: [0.55, 0.06, 0.68, 0.19] // Custom easing for smooth exit
    }
  }
}

// Enhanced variants for message content with stagger effect
const messageContentVariants = {
  hidden: { 
    opacity: 0,
    y: 10
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

// Variants for message bubble with subtle scale animation
const messageBubbleVariants = {
  hidden: { 
    scale: 0.95,
    opacity: 0
  },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      delay: 0.1
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

const statusIndicatorVariants = {
  sending: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  sent: {
    opacity: 1,
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  error: {
    opacity: 1,
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
}

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return timestamp.toLocaleDateString()
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'sending':
      return (
        <motion.div
          variants={statusIndicatorVariants}
          animate="sending"
          className="w-2 h-2 bg-yellow-500 rounded-full"
          aria-label="Sending message"
        />
      )
    case 'sent':
      return (
        <motion.div
          variants={statusIndicatorVariants}
          animate="sent"
          className="w-2 h-2 bg-green-500 rounded-full"
          aria-label="Message sent"
        />
      )
    case 'error':
      return (
        <motion.div
          variants={statusIndicatorVariants}
          animate="error"
          className="w-2 h-2 bg-red-500 rounded-full"
          aria-label="Message failed to send"
        />
      )
    case 'regenerating':
      return (
        <motion.div
          variants={statusIndicatorVariants}
          animate="sending"
          className="w-2 h-2 bg-blue-500 rounded-full"
          aria-label="Regenerating response"
        />
      )
    default:
      return null
  }
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  showActions = false, 
  onCopy, 
  onRegenerate, 
  onFeedback,
  className,
  children 
}) => {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  
  return (
    <div
      className={cn(
        "group relative flex w-full gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      role="article"
      aria-label={`${message.role} message`}
    >
      {/* Avatar/Icon for non-user messages */}
      {!isUser && (
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
          isSystem 
            ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            : "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
        )}>
          {isSystem ? 'S' : 'AI'}
        </div>
      )}

      {/* Message Content Container */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[80%] sm:max-w-[70%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <motion.div 
          variants={messageBubbleVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className={cn(
            "relative px-4 py-3 rounded-2xl break-words",
            "shadow-sm border transition-all duration-200",
            // User message styling
            isUser && [
              "bg-primary-500 text-white border-primary-600",
              "dark:bg-primary-600 dark:border-primary-700",
              "rounded-br-md" // Sharp corner on bottom right for user messages
            ],
            // Assistant message styling
            !isUser && !isSystem && [
              "bg-white text-gray-900 border-gray-200",
              "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
              "rounded-bl-md", // Sharp corner on bottom left for assistant messages
              "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
            ],
            // System message styling
            isSystem && [
              "bg-gray-50 text-gray-700 border-gray-200",
              "dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
              "rounded-lg text-sm italic"
            ]
          )}
        >
          {/* Message Content */}
          <motion.div 
            variants={messageContentVariants}
            className={cn(
              "prose prose-sm max-w-none",
              isUser && "prose-invert",
              !isUser && "dark:prose-invert"
            )}
          >
            <p className="m-0 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </motion.div>

          {/* Message Metadata */}
          {message.metadata && (
            <div className={cn(
              "mt-2 pt-2 border-t text-xs opacity-70",
              isUser 
                ? "border-primary-400 text-primary-100" 
                : "border-gray-200 text-gray-500 dark:border-gray-600 dark:text-gray-400"
            )}>
              {message.metadata.model && (
                <span className="mr-3">Model: {message.metadata.model}</span>
              )}
              {message.metadata.tokens && (
                <span className="mr-3">Tokens: {message.metadata.tokens}</span>
              )}
              {message.metadata.processingTime && (
                <span>Time: {message.metadata.processingTime}ms</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Timestamp and Status */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <time 
            dateTime={message.timestamp.toISOString()}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            {formatTimestamp(message.timestamp)}
          </time>
          
          {message.status && getStatusIcon(message.status)}
          
          {/* Feedback indicator */}
          {message.feedback && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-xs",
                message.feedback.rating === 'positive' 
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              )}
              title={`Feedback: ${message.feedback.rating}`}
            >
              {message.feedback.rating === 'positive' ? '👍' : '👎'}
            </motion.div>
          )}
        </div>

        {/* Message Actions */}
        {showActions && (onCopy || onRegenerate || onFeedback) && (
          <div className={cn(
            "mt-2",
            isUser ? "self-end" : "self-start"
          )}>
            <MessageActions
              messageId={message.id}
              messageRole={message.role}
              onCopy={onCopy}
              onRegenerate={onRegenerate}
              onFeedback={onFeedback}
            />
          </div>
        )}

        {/* Custom children content */}
        {children && (
          <div className={cn(
            "mt-2",
            isUser ? "self-end" : "self-start"
          )}>
            {children}
          </div>
        )}
      </div>

      {/* User Avatar for user messages */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
          U
        </div>
      )}
    </div>
  )
}

export default ChatMessage