'use client'

import React from 'react'
import { Button } from './button'
import { Card } from './card'
import Layout from './layout'
import { 
  XMarkIcon,
  DocumentArrowUpIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ConversationImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: string, format: 'json' | 'markdown') => Promise<void>
  loading?: boolean
}

export function ConversationImportModal({
  isOpen,
  onClose,
  onImport,
  loading = false
}: ConversationImportModalProps) {
  const [format, setFormat] = React.useState<'json' | 'markdown'>('json')
  const [data, setData] = React.useState('')
  const [dragActive, setDragActive] = React.useState(false)
  const [imported, setImported] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImport = async () => {
    if (!data.trim()) {
      setError('Please provide data to import')
      return
    }

    try {
      setError(null)
      await onImport(data, format)
      setImported(true)
      setTimeout(() => {
        setImported(false)
        handleClose()
      }, 1500)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Import failed')
    }
  }

  const handleClose = () => {
    if (!loading) {
      setData('')
      setError(null)
      setImported(false)
      onClose()
    }
  }

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setData(content)
      
      // Auto-detect format based on file extension
      if (file.name.endsWith('.json')) {
        setFormat('json')
      } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
        setFormat('markdown')
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-background max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <Layout.Flex justify="between" align="center" className="mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Import Conversation
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Import a previously exported conversation
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

          {imported ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Import Complete
              </h3>
              <p className="text-xs text-muted-foreground">
                Your conversation has been imported successfully
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Format selection */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-3">
                  Import Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'json', label: 'JSON', desc: 'Exported JSON data' },
                    { value: 'markdown', label: 'Markdown', desc: 'Markdown format' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormat(option.value as any)}
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

              {/* File upload area */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-3">
                  Import Data
                </label>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/80'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <DocumentArrowUpIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-foreground mb-2">
                    Drop a file here or click to select
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Supports .json and .md files
                  </p>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.md,.markdown,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Text area for manual input */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-3">
                  Or paste data directly
                </label>
                <textarea
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  placeholder={`Paste your ${format.toUpperCase()} data here...`}
                  className="w-full h-32 p-3 border border-border rounded-lg bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

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
                  onClick={handleImport}
                  loading={loading}
                  disabled={loading || !data.trim()}
                >
                  <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </Layout.Flex>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ConversationImportModal