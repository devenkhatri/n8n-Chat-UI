'use client'

import React from 'react'
import { Button } from './button'
import { Card } from './card'
import Layout from './layout'
import { 
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { 
  HandThumbUpIcon as HandThumbUpIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid
} from '@heroicons/react/24/solid'

export interface MessageFeedback {
  rating: 'positive' | 'negative' | null
  comment?: string
  timestamp: Date
}

interface MessageFeedbackProps {
  messageId: string
  feedback?: MessageFeedback
  onFeedback: (messageId: string, rating: 'positive' | 'negative', comment?: string) => void
  onRemoveFeedback?: (messageId: string) => void
  disabled?: boolean
  compact?: boolean
  className?: string
}

export function MessageFeedbackComponent({
  messageId,
  feedback,
  onFeedback,
  onRemoveFeedback,
  disabled = false,
  compact = false,
  className
}: MessageFeedbackProps) {
  const [showCommentForm, setShowCommentForm] = React.useState(false)
  const [comment, setComment] = React.useState(feedback?.comment || '')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleRating = async (rating: 'positive' | 'negative') => {
    if (disabled || isSubmitting) return

    try {
      setIsSubmitting(true)
      
      // If same rating is clicked, remove feedback
      if (feedback?.rating === rating) {
        onRemoveFeedback?.(messageId)
        setShowCommentForm(false)
        setComment('')
        return
      }

      // For negative feedback, always show comment form
      if (rating === 'negative') {
        setShowCommentForm(true)
        return
      }

      // For positive feedback, submit immediately
      await onFeedback(messageId, rating)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (disabled || isSubmitting) return

    try {
      setIsSubmitting(true)
      await onFeedback(messageId, 'negative', comment.trim() || undefined)
      setShowCommentForm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentCancel = () => {
    setShowCommentForm(false)
    setComment(feedback?.comment || '')
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating('positive')}
          disabled={disabled || isSubmitting}
          className={`h-6 w-6 p-0 ${
            feedback?.rating === 'positive' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-muted-foreground hover:text-green-600 dark:hover:text-green-400'
          }`}
        >
          {feedback?.rating === 'positive' ? (
            <HandThumbUpIconSolid className="h-3 w-3" />
          ) : (
            <HandThumbUpIcon className="h-3 w-3" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating('negative')}
          disabled={disabled || isSubmitting}
          className={`h-6 w-6 p-0 ${
            feedback?.rating === 'negative' 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-muted-foreground hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          {feedback?.rating === 'negative' ? (
            <HandThumbDownIconSolid className="h-3 w-3" />
          ) : (
            <HandThumbDownIcon className="h-3 w-3" />
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Rating buttons */}
      <Layout.Flex align="center" className="gap-2">
        <span className="text-xs text-muted-foreground">Was this helpful?</span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating('positive')}
          disabled={disabled || isSubmitting}
          className={`flex items-center gap-1 ${
            feedback?.rating === 'positive' 
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
              : 'text-muted-foreground hover:text-green-600 dark:hover:text-green-400'
          }`}
        >
          {feedback?.rating === 'positive' ? (
            <HandThumbUpIconSolid className="h-4 w-4" />
          ) : (
            <HandThumbUpIcon className="h-4 w-4" />
          )}
          <span className="text-xs">Yes</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRating('negative')}
          disabled={disabled || isSubmitting}
          className={`flex items-center gap-1 ${
            feedback?.rating === 'negative' 
              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' 
              : 'text-muted-foreground hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          {feedback?.rating === 'negative' ? (
            <HandThumbDownIconSolid className="h-4 w-4" />
          ) : (
            <HandThumbDownIcon className="h-4 w-4" />
          )}
          <span className="text-xs">No</span>
        </Button>
      </Layout.Flex>

      {/* Comment form for negative feedback */}
      {showCommentForm && (
        <Card className="p-4 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10">
          <div className="space-y-3">
            <Layout.Flex align="center" className="gap-2">
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Help us improve
              </span>
            </Layout.Flex>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could be better? (optional)"
              className="w-full p-2 text-sm border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={3}
              maxLength={500}
              disabled={disabled || isSubmitting}
            />
            
            <Layout.Flex justify="between" align="center">
              <span className="text-xs text-muted-foreground">
                {comment.length}/500 characters
              </span>
              
              <Layout.Flex className="gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCommentCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCommentSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Submit Feedback
                </Button>
              </Layout.Flex>
            </Layout.Flex>
          </div>
        </Card>
      )}

      {/* Existing feedback display */}
      {feedback && !showCommentForm && (
        <div className="text-xs text-muted-foreground">
          <Layout.Flex align="center" className="gap-2">
            <span>
              Feedback submitted {feedback.timestamp.toLocaleDateString()}
            </span>
            {onRemoveFeedback && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFeedback(messageId)}
                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
              >
                <XMarkIcon className="h-3 w-3" />
              </Button>
            )}
          </Layout.Flex>
          {feedback.comment && (
            <p className="mt-1 text-xs text-muted-foreground italic">
              "{feedback.comment}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default MessageFeedbackComponent