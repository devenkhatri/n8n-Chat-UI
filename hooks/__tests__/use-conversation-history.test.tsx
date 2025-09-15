import { renderHook, act } from '@testing-library/react'
import { useConversationHistory } from '../use-conversation-history'
import { conversationStorage } from '../../lib/utils/conversation-storage'
import { ChatMessage } from '../../lib/types/ui'

// Mock the conversation storage
jest.mock('../../lib/utils/conversation-storage', () => ({
  conversationStorage: {
    list: jest.fn(),
    load: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    export: jest.fn(),
    import: jest.fn(),
  },
  generateConversationTitle: jest.fn((messages) => 
    messages.length > 0 ? messages[0].content.substring(0, 20) : 'New Conversation'
  ),
  createConversation: jest.fn((messages, title) => ({
    id: 'mock-id',
    title: title || 'Mock Conversation',
    messages,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      messageCount: messages.length,
      lastActivity: new Date()
    }
  }))
}))

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid')
  }
})

const mockConversationStorage = conversationStorage as jest.Mocked<typeof conversationStorage>

describe('useConversationHistory', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello, how are you?',
      timestamp: new Date()
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I am doing well, thank you!',
      timestamp: new Date()
    }
  ]

  const mockConversationSummaries = [
    {
      id: '1',
      title: 'Test Conversation',
      messageCount: 2,
      lastActivity: new Date(),
      preview: 'Hello, how are you?',
      starred: false,
      archived: false
    }
  ]

  const mockConversation = {
    id: '1',
    title: 'Test Conversation',
    messages: mockMessages,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      messageCount: 2,
      lastActivity: new Date()
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockConversationStorage.list.mockResolvedValue(mockConversationSummaries)
    mockConversationStorage.load.mockResolvedValue(mockConversation)
    mockConversationStorage.save.mockResolvedValue()
    mockConversationStorage.delete.mockResolvedValue()
    mockConversationStorage.search.mockResolvedValue(mockConversationSummaries)
    mockConversationStorage.export.mockResolvedValue('exported data')
    mockConversationStorage.import.mockResolvedValue(mockConversation)
  })

  it('should load conversations on mount', async () => {
    const { result } = renderHook(() => useConversationHistory())

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(mockConversationStorage.list).toHaveBeenCalled()
    expect(result.current.conversations).toEqual(mockConversationSummaries)
  })

  it('should load specific conversation', async () => {
    const { result } = renderHook(() => useConversationHistory())

    await act(async () => {
      await result.current.loadConversation('1')
    })

    expect(mockConversationStorage.load).toHaveBeenCalledWith('1')
    expect(result.current.currentConversation).toEqual(mockConversation)
  })

  it('should save conversation', async () => {
    const { result } = renderHook(() => useConversationHistory())

    await act(async () => {
      await result.current.saveConversation(mockMessages, 'Test Title')
    })

    expect(mockConversationStorage.save).toHaveBeenCalled()
    expect(mockConversationStorage.list).toHaveBeenCalled() // Should refresh list
  })

  it('should delete conversation', async () => {
    const { result } = renderHook(() => useConversationHistory())

    await act(async () => {
      await result.current.deleteConversation('1')
    })

    expect(mockConversationStorage.delete).toHaveBeenCalledWith('1')
    expect(mockConversationStorage.list).toHaveBeenCalled() // Should refresh list
  })

  it('should search conversations', async () => {
    const { result } = renderHook(() => useConversationHistory())

    await act(async () => {
      await result.current.searchConversations('test query')
    })

    expect(mockConversationStorage.search).toHaveBeenCalledWith('test query')
    expect(result.current.conversations).toEqual(mockConversationSummaries)
  })

  it('should export conversation', async () => {
    const { result } = renderHook(() => useConversationHistory())

    const exportOptions = {
      format: 'json' as const,
      includeMetadata: true
    }

    let exportResult: string = ''
    await act(async () => {
      exportResult = await result.current.exportConversation('1', exportOptions)
    })

    expect(mockConversationStorage.export).toHaveBeenCalledWith('1', exportOptions)
    expect(exportResult).toBe('exported data')
  })

  it('should import conversation', async () => {
    const { result } = renderHook(() => useConversationHistory())

    const importData = '{"id":"1","title":"Imported"}'

    await act(async () => {
      await result.current.importConversation(importData, 'json')
    })

    expect(mockConversationStorage.import).toHaveBeenCalledWith(importData, 'json')
    expect(mockConversationStorage.save).toHaveBeenCalled()
    expect(mockConversationStorage.list).toHaveBeenCalled() // Should refresh list
  })

  it('should toggle star status', async () => {
    const { result } = renderHook(() => useConversationHistory())

    await act(async () => {
      await result.current.toggleStar('1')
    })

    expect(mockConversationStorage.load).toHaveBeenCalledWith('1')
    expect(mockConversationStorage.save).toHaveBeenCalled()
  })

  it('should toggle archive status', async () => {
    const { result } = renderHook(() => useConversationHistory())

    await act(async () => {
      await result.current.toggleArchive('1')
    })

    expect(mockConversationStorage.load).toHaveBeenCalledWith('1')
    expect(mockConversationStorage.save).toHaveBeenCalled()
  })

  it('should clear all history', async () => {
    const { result } = renderHook(() => useConversationHistory())

    await act(async () => {
      await result.current.clearHistory()
    })

    expect(mockConversationStorage.list).toHaveBeenCalled()
    expect(mockConversationStorage.delete).toHaveBeenCalledWith('1')
    expect(result.current.conversations).toEqual([])
    expect(result.current.currentConversation).toBeNull()
  })

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useConversationHistory())

    mockConversationStorage.load.mockRejectedValue(new Error('Load failed'))

    await act(async () => {
      await result.current.loadConversation('1')
    })

    expect(result.current.error).toBe('Load failed')
    expect(result.current.currentConversation).toBeNull()
  })

  it('should set loading state correctly', async () => {
    const { result } = renderHook(() => useConversationHistory())

    // Mock a slow operation
    mockConversationStorage.list.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockConversationSummaries), 100))
    )

    act(() => {
      result.current.loadConversations()
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150))
    })

    expect(result.current.loading).toBe(false)
  })
})