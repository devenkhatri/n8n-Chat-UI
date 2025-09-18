import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

interface MessageActionsProps {
  messageId: string
  messageRole: 'user' | 'assistant' | 'system'
  onCopy?: () => void
  onRegenerate?: () => void
  onFeedback?: (type: 'positive' | 'negative') => void
  className?: string
}

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const MessageActions: React.FC<MessageActionsProps> = ({
  messageRole,
  onCopy,
  onRegenerate,
  onFeedback,
  className
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (onCopy) {
      onCopy()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerate = () => {
    if (onRegenerate) {
      setShowConfirmDialog(true)
    }
  }

  const confirmRegenerate = () => {
    if (onRegenerate) {
      onRegenerate()
    }
    setShowConfirmDialog(false)
  }

  const handleFeedback = (type: 'positive' | 'negative') => {
    if (onFeedback) {
      onFeedback(type)
      setFeedbackGiven(type)
    }
  }

  const actionButtonClass = cn(
    "p-2 rounded-md transition-all duration-200",
    "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    "dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700",
    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  )

  const feedbackButtonClass = (type: 'positive' | 'negative', isActive: boolean) => cn(
    actionButtonClass,
    isActive && type === 'positive' && "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
    isActive && type === 'negative' && "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
  )

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          className
        )}
      >
        {/* Copy Button */}
        {onCopy && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className={actionButtonClass}
            title="Copy message"
            aria-label="Copy message to clipboard"
          >
            {copied ? (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </motion.button>
        )}

        {/* Regenerate Button - Only for assistant messages */}
        {onRegenerate && messageRole === 'assistant' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRegenerate}
            className={actionButtonClass}
            title="Regenerate response"
            aria-label="Regenerate this response"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        )}

        {/* Feedback Buttons - Only for assistant messages */}
        {onFeedback && messageRole === 'assistant' && (
          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-gray-200 dark:border-gray-600">
            {/* Positive Feedback */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeedback('positive')}
              className={feedbackButtonClass('positive', feedbackGiven === 'positive')}
              title="This response was helpful"
              aria-label="Mark response as helpful"
              disabled={feedbackGiven !== null}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </motion.button>

            {/* Negative Feedback */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeedback('negative')}
              className={feedbackButtonClass('negative', feedbackGiven === 'negative')}
              title="This response was not helpful"
              aria-label="Mark response as not helpful"
              disabled={feedbackGiven !== null}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmRegenerate}
        title="Regenerate Response"
        message="Are you sure you want to regenerate this response? This action cannot be undone."
        confirmText="Regenerate"
        cancelText="Cancel"
      />
    </>
  )
}

export default MessageActions