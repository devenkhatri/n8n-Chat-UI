'use client'

import React from 'react'
import { ConversationSummary } from '../../lib/types/conversation'
import { Button } from './button'
import { Card } from './card'
import { Input } from './input'
import Layout from './layout'
import { 
  MagnifyingGlassIcon, 
  StarIcon, 
  ArchiveBoxIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface ConversationListProps {
  conversations: ConversationSummary[]
  selectedId?: string
  loading?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onSelect?: (id: string) => void
  onStar?: (id: string) => void
  onArchive?: (id: string) => void
  onDelete?: (id: string) => void
  onExport?: (id: string) => void
  showArchived?: boolean
  onToggleArchived?: () => void
  className?: string
}

export function ConversationList({
  conversations,
  selectedId,
  loading = false,
  searchQuery = '',
  onSearchChange,
  onSelect,
  onStar,
  onArchive,
  onDelete,
  onExport,
  showArchived = false,
  onToggleArchived,
  className
}: ConversationListProps) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null)

  const filteredConversations = conversations.filter(conv => 
    showArchived ? conv.archived : !conv.archived
  )

  const handleMenuToggle = (id: string) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

  const handleAction = (action: () => void) => {
    action()
    setActiveMenu(null)
  }

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filters */}
      <div className="space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Layout.Flex justify="between" align="center">
          <span className="text-sm text-muted-foreground">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleArchived}
            className="text-xs"
          >
            <ArchiveBoxIcon className="h-4 w-4 mr-1" />
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
        </Layout.Flex>
      </div>

      {/* Conversation list */}
      <div className="space-y-2">
        {filteredConversations.length === 0 ? (
          <Card className="p-8 text-center">
            <ChatBubbleLeftIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              {showArchived ? 'No archived conversations' : 'No conversations yet'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {showArchived 
                ? 'Archived conversations will appear here' 
                : 'Start a new conversation to see it here'
              }
            </p>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              variant={selectedId === conversation.id ? 'elevated' : 'default'}
              className={`p-4 cursor-pointer transition-all hover:shadow-sm ${
                selectedId === conversation.id ? 'ring-2 ring-primary/20' : ''
              }`}
              onClick={() => onSelect?.(conversation.id)}
            >
              <div className="space-y-2">
                {/* Header */}
                <Layout.Flex justify="between" align="start" className="gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''} • {' '}
                      {conversation.lastActivity.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {conversation.starred && (
                      <StarIconSolid className="h-4 w-4 text-yellow-500" />
                    )}
                    
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMenuToggle(conversation.id)
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </Button>
                      
                      {activeMenu === conversation.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-10">
                          <div className="py-1">
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAction(() => onStar?.(conversation.id))
                              }}
                            >
                              {conversation.starred ? (
                                <StarIconSolid className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <StarIcon className="h-4 w-4" />
                              )}
                              {conversation.starred ? 'Unstar' : 'Star'}
                            </button>
                            
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAction(() => onArchive?.(conversation.id))
                              }}
                            >
                              <ArchiveBoxIcon className="h-4 w-4" />
                              {conversation.archived ? 'Unarchive' : 'Archive'}
                            </button>
                            
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAction(() => onExport?.(conversation.id))
                              }}
                            >
                              Export
                            </button>
                            
                            <hr className="my-1 border-border" />
                            
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-destructive flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAction(() => onDelete?.(conversation.id))
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Layout.Flex>

                {/* Preview */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {conversation.preview}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default ConversationList