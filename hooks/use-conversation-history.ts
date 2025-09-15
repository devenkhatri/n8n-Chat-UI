'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Conversation, 
  ConversationSummary, 
  ConversationFilter, 
  ConversationExportOptions 
} from '../lib/types/conversation'
import { ChatMessage } from '../lib/types/ui'
import { 
  conversationStorage, 
  generateConversationTitle, 
  createConversation 
} from '../lib/utils/conversation-storage'

export interface UseConversationHistoryReturn {
  // State
  conversations: ConversationSummary[]
  currentConversation: Conversation | null
  loading: boolean
  error: string | null
  
  // Actions
  loadConversations: (filter?: ConversationFilter) => Promise<void>
  loadConversation: (id: string) => Promise<void>
  saveConversation: (messages: ChatMessage[], title?: string) => Promise<string>
  updateConversation: (id: string, updates: Partial<Conversation>) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  searchConversations: (query: string) => Promise<void>
  exportConversation: (id: string, options: ConversationExportOptions) => Promise<string>
  importConversation: (data: string, format: 'json' | 'markdown') => Promise<Conversation>
  
  // Utilities
  createNewConversation: (messages: ChatMessage[], title?: string) => Conversation
  toggleStar: (id: string) => Promise<void>
  toggleArchive: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
}

export function useConversationHistory(): UseConversationHistoryReturn {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: unknown, action: string) => {
    const message = error instanceof Error ? error.message : `Failed to ${action}`
    setError(message)
    console.error(`Conversation history error (${action}):`, error)
  }, [])

  const loadConversations = useCallback(async (filter?: ConversationFilter) => {
    try {
      setLoading(true)
      setError(null)
      const summaries = await conversationStorage.list(filter)
      setConversations(summaries)
    } catch (error) {
      handleError(error, 'load conversations')
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const loadConversation = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const conversation = await conversationStorage.load(id)
      setCurrentConversation(conversation)
      if (!conversation) {
        setError('Conversation not found')
      }
    } catch (error) {
      handleError(error, 'load conversation')
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const saveConversation = useCallback(async (messages: ChatMessage[], title?: string): Promise<string> => {
    try {
      setError(null)
      const conversation = createConversation(messages, title)
      await conversationStorage.save(conversation)
      
      // Refresh conversations list
      await loadConversations()
      
      return conversation.id
    } catch (error) {
      handleError(error, 'save conversation')
      throw error
    }
  }, [handleError, loadConversations])

  const updateConversation = useCallback(async (id: string, updates: Partial<Conversation>) => {
    try {
      setError(null)
      const existing = await conversationStorage.load(id)
      if (!existing) {
        throw new Error('Conversation not found')
      }
      
      const updated = { ...existing, ...updates, updatedAt: new Date() }
      await conversationStorage.save(updated)
      
      // Update current conversation if it's the one being updated
      if (currentConversation?.id === id) {
        setCurrentConversation(updated)
      }
      
      // Refresh conversations list
      await loadConversations()
    } catch (error) {
      handleError(error, 'update conversation')
    }
  }, [handleError, loadConversations, currentConversation])

  const deleteConversation = useCallback(async (id: string) => {
    try {
      setError(null)
      await conversationStorage.delete(id)
      
      // Clear current conversation if it's the one being deleted
      if (currentConversation?.id === id) {
        setCurrentConversation(null)
      }
      
      // Refresh conversations list
      await loadConversations()
    } catch (error) {
      handleError(error, 'delete conversation')
    }
  }, [handleError, loadConversations, currentConversation])

  const searchConversations = useCallback(async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      const results = await conversationStorage.search(query)
      setConversations(results)
    } catch (error) {
      handleError(error, 'search conversations')
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const exportConversation = useCallback(async (id: string, options: ConversationExportOptions): Promise<string> => {
    try {
      setError(null)
      return await conversationStorage.export(id, options)
    } catch (error) {
      handleError(error, 'export conversation')
      throw error
    }
  }, [handleError])

  const importConversation = useCallback(async (data: string, format: 'json' | 'markdown'): Promise<Conversation> => {
    try {
      setError(null)
      const conversation = await conversationStorage.import(data, format)
      await conversationStorage.save(conversation)
      
      // Refresh conversations list
      await loadConversations()
      
      return conversation
    } catch (error) {
      handleError(error, 'import conversation')
      throw error
    }
  }, [handleError, loadConversations])

  const createNewConversation = useCallback((messages: ChatMessage[], title?: string): Conversation => {
    return createConversation(messages, title)
  }, [])

  const toggleStar = useCallback(async (id: string) => {
    try {
      const conversation = await conversationStorage.load(id)
      if (!conversation) return
      
      const starred = !conversation.metadata?.starred
      await updateConversation(id, {
        metadata: {
          ...conversation.metadata,
          starred
        }
      })
    } catch (error) {
      handleError(error, 'toggle star')
    }
  }, [handleError, updateConversation])

  const toggleArchive = useCallback(async (id: string) => {
    try {
      const conversation = await conversationStorage.load(id)
      if (!conversation) return
      
      const archived = !conversation.metadata?.archived
      await updateConversation(id, {
        metadata: {
          ...conversation.metadata,
          archived
        }
      })
    } catch (error) {
      handleError(error, 'toggle archive')
    }
  }, [handleError, updateConversation])

  const clearHistory = useCallback(async () => {
    try {
      setError(null)
      const allConversations = await conversationStorage.list()
      
      // Delete all conversations
      await Promise.all(
        allConversations.map(conv => conversationStorage.delete(conv.id))
      )
      
      setConversations([])
      setCurrentConversation(null)
    } catch (error) {
      handleError(error, 'clear history')
    }
  }, [handleError])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    // State
    conversations,
    currentConversation,
    loading,
    error,
    
    // Actions
    loadConversations,
    loadConversation,
    saveConversation,
    updateConversation,
    deleteConversation,
    searchConversations,
    exportConversation,
    importConversation,
    
    // Utilities
    createNewConversation,
    toggleStar,
    toggleArchive,
    clearHistory
  }
}