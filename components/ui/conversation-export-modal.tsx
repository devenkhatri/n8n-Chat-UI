'use client'

import React from 'react'
import { ConversationExportOptions } from '../../lib/types/conversation'
import Button from './button'
import Card from './card'

import Layout from './layout'
import { 
  XMarkIcon,
  DocumentArrowDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface ConversationExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: ConversationExportOptions) => Promise<void>
  conversationTitle?: string
  loading?: boolean
}

export function ConversationExportModal({
  isOpen,
  onClose,
  onExport,
  conversationTitle = 'Conversation',
  loading = false
}: ConversationExportModalProps) {
  const [format, setFormat] = React.useState<'json' | 'markdown' | 'txt'>('markdown')
  const [includeMetadata, setIncludeMetadata] = React.useState(true)
  const [includeTimestamps, setIncludeTimestamps] = React.useState(true)
  const [exported, setExported] = React.useState(false)

  const handleExport = async () => {
    try {
      await onExport({
        format,
        includeMetadata,
        includeTimestamps
      })
      setExported(true)
      setTimeout(() => {
        setExported(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setExported(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background">
        <div className="p-6">
          {/* Header */}
          <Layout.Flex justify="between" align="center" className="mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Export Conversation
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {conversationTitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </Layout.Flex>

          {exported ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Export Complete
              </h3>
              <p className="text-xs text-muted-foreground">
                Your conversation has been downloaded
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Format selection */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'markdown', label: 'Markdown', desc: 'Human-readable format' },
                    { value: 'json', label: 'JSON', desc: 'Structured data' },
                    { value: 'txt', label: 'Text', desc: 'Plain text format' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormat(option.value as 'json' | 'markdown' | 'txt')}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        format === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-3">
                  Include Options
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="rounded border-border"
                    />
                    <div>
                      <div className="text-sm text-foreground">Metadata</div>
                      <div className="text-xs text-muted-foreground">
                        Creation date, message count, tags
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTimestamps}
                      onChange={(e) => setIncludeTimestamps(e.target.checked)}
                      className="rounded border-border"
                    />
                    <div>
                      <div className="text-sm text-foreground">Timestamps</div>
                      <div className="text-xs text-muted-foreground">
                        When each message was sent
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <Layout.Flex justify="end" className="gap-3 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  loading={loading}
                  disabled={loading}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </Layout.Flex>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ConversationExportModal