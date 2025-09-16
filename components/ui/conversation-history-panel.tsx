'use client'

import React from 'react'
import { useConversationHistory } from '../../hooks/use-conversation-history'
import { ConversationExportOptions } from '../../lib/types/conversation'
import { ChatMessage } from '../../lib/types/ui'
import Button from './button'
import Card from './card'
import ConversationList from './conversation-list'
import ConversationExportModal from './conversation-export-modal'
import ConversationImportModal from './conversation-import-modal'
import Layout from './layout'
import { 
  PlusIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ConversationHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  onSelectConversation?: (messages: ChatMessage[]) => void
  onNewConversation?: () => void
  currentMessages?: ChatMessage[]
  className?: string
}

export function ConversationHistoryPanel({
  isOpen,
  onClose,
  onSelectConversation,
  onNewConversation,
  currentMessages = [],
  className
}: ConversationHistoryPanelProps) {
  const {
    conversations,
    currentConversation,
    loading,
    error,
    loadConversation,
    saveConversation,
    deleteConversation,
    searchConversations,
    exportConversation,
    importConversation,
    toggleStar,
    toggleArchive,
    clearHistory
  } = useConversationHistory()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [showArchived, setShowArchived] = React.useState(false)
  const [exportModal, setExportModal] = React.useState<{
    isOpen: boolean
    conversationId?: string
    title?: string
  }>({ isOpen: false })
  const [importModal, setImportModal] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined)

  // Handle search with debouncing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchConversations(searchQuery)
      } else {
        // Reload all conversations when search is cleared
        // This will be handled by the hook's internal state
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchConversations])

  const handleSelectConversation = async (id: string) => {
    setSelectedId(id)
    await loadConversation(id)
    
    if (currentConversation && onSelectConversation) {
      onSelectConversation(currentConversation.messages)
    }
  }

  const handleSaveCurrentConversation = async () => {
    if (currentMessages.length > 0) {
      try {
        await saveConversation(currentMessages)
      } catch (error) {
        console.error('Failed to save conversation:', error)
      }
    }
  }

  const handleExport = async (id: string) => {
    const conversation = conversations.find(c => c.id === id)
    setExportModal({
      isOpen: true,
      conversationId: id,
      title: conversation?.title
    })
  }

  const handleExportConfirm = async (options: ConversationExportOptions) => {
    if (!exportModal.conversationId) return

    try {
      const data = await exportConversation(exportModal.conversationId, options)
      
      // Create and download file
      const blob = new Blob([data], { 
        type: options.format === 'json' ? 'application/json' : 'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversation-${exportModal.conversationId}.${options.format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setExportModal({ isOpen: false })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleImport = async (data: string, format: 'json' | 'markdown') => {
    try {
      await importConversation(data, format)
      setImportModal(false)
    } catch (error) {
      console.error('Import failed:', error)
      throw error
    }
  }

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to delete all conversations? This action cannot be undone.')) {
      await clearHistory()
      setSelectedId(undefined)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Layout.Flex justify="between" align="center" className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Conversation History
              </h2>
              {onNewConversation && (
                <button
                  onClick={onNewConversation}
                  className="p-1 text-sm text-muted-foreground hover:text-foreground"
                  title="Start new conversation"
                >
                  <span className="sr-only">New conversation</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </Layout.Flex>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveCurrentConversation}
              disabled={currentMessages.length === 0}
              className="justify-start"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Save Current
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImportModal(true)}
              className="justify-start"
            >
              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="p-4">
              <Card className="p-4 border-destructive/20 bg-destructive/5">
                <p className="text-sm text-destructive">{error}</p>
              </Card>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelect={handleSelectConversation}
                onStar={toggleStar}
                onArchive={toggleArchive}
                onDelete={deleteConversation}
                onExport={handleExport}
                showArchived={showArchived}
                onToggleArchived={() => setShowArchived(!showArchived)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Layout.Flex justify="between" align="center">
            <span className="text-xs text-muted-foreground">
              {conversations.length} total conversations
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              disabled={conversations.length === 0}
              className="text-destructive hover:text-destructive"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </Layout.Flex>
        </div>
      </div>

      {/* Export Modal */}
      <ConversationExportModal
        isOpen={exportModal.isOpen}
        onClose={() => setExportModal({ isOpen: false })}
        onExport={handleExportConfirm}
        conversationTitle={exportModal.title}
      />

      {/* Import Modal */}
      <ConversationImportModal
        isOpen={importModal}
        onClose={() => setImportModal(false)}
        onImport={handleImport}
      />
    </>
  )
}

export default ConversationHistoryPanel