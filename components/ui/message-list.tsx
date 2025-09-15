import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatMessage from './chat-message'
import { type ChatMessageProps } from '../../lib/types/ui'

interface MessageListProps {
  messages: ChatMessageProps['message'][]
  showActions?: boolean
  onCopy?: (messageId: string) => void
  onRegenerate?: (messageId: string) => void
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void
  className?: string
}

// Container variants for stagger animation
const messageListVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
}

// Individual message variants for stagger effect
const messageItemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0, 
    y: -30,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: [0.55, 0.06, 0.68, 0.19]
    }
  }
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  showActions = false,
  onCopy,
  onRegenerate,
  onFeedback,
  className
}) => {
  return (
    <motion.div
      variants={messageListVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            variants={messageItemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            layoutId={message.id}
            className="mb-4"
          >
            <ChatMessage
              message={message}
              showActions={showActions && message.role === 'assistant'}
              onCopy={onCopy ? () => onCopy(message.id) : undefined}
              onRegenerate={onRegenerate ? () => onRegenerate(message.id) : undefined}
              onFeedback={onFeedback ? (type) => onFeedback(message.id, type) : undefined}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default MessageList