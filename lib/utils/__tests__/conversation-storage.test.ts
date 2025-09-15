import { conversationStorage, generateConversationTitle, createConversation } from '../conversation-storage'
import { ChatMessage } from '../../types/ui'
import { Conversation } from '../../types/conversation'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9))
  }
})

describe('conversation-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello, how are you?',
      timestamp: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I am doing well, thank you for asking!',
      timestamp: new Date('2024-01-01T10:01:00Z')
    }
  ]

  describe('generateConversationTitle', () => {
    it('should generate title from first user message', () => {
      const title = generateConversationTitle(mockMessages)
      expect(title).toBe('Hello, how are you?')
    })

    it('should truncate long titles', () => {
      const longMessages: ChatMessage[] = [
        {
          id: '1',
          role: 'user',
          content: 'This is a very long message that should be truncated because it exceeds the maximum length',
          timestamp: new Date()
        }
      ]
      const title = generateConversationTitle(longMessages)
      expect(title).toBe('This is a very long message...')
    })

    it('should return default title for empty messages', () => {
      const title = generateConversationTitle([])
      expect(title).toBe('New Conversation')
    })

    it('should return default title when no user messages', () => {
      const assistantOnlyMessages: ChatMessage[] = [
        {
          id: '1',
          role: 'assistant',
          content: 'Hello there!',
          timestamp: new Date()
        }
      ]
      const title = generateConversationTitle(assistantOnlyMessages)
      expect(title).toBe('New Conversation')
    })
  })

  describe('createConversation', () => {
    it('should create conversation with generated title', () => {
      const conversation = createConversation(mockMessages)
      
      expect(conversation).toMatchObject({
        title: 'Hello, how are you?',
        messages: mockMessages,
        metadata: {
          messageCount: 2
        }
      })
      expect(conversation.id).toBeDefined()
      expect(conversation.createdAt).toBeInstanceOf(Date)
      expect(conversation.updatedAt).toBeInstanceOf(Date)
    })

    it('should create conversation with custom title', () => {
      const customTitle = 'Custom Title'
      const conversation = createConversation(mockMessages, customTitle)
      
      expect(conversation.title).toBe(customTitle)
    })
  })

  describe('conversationStorage', () => {
    describe('save and load', () => {
      it('should save and load conversation', async () => {
        const conversation = createConversation(mockMessages)
        
        // Mock empty storage initially
        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: {},
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 0 }
        }))

        await conversationStorage.save(conversation)
        
        expect(localStorageMock.setItem).toHaveBeenCalled()
        
        // Mock storage with saved conversation
        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: { [conversation.id]: conversation },
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 1 }
        }))

        const loaded = await conversationStorage.load(conversation.id)
        expect(loaded).toMatchObject({
          id: conversation.id,
          title: conversation.title,
          messages: expect.arrayContaining([
            expect.objectContaining({ content: 'Hello, how are you?' }),
            expect.objectContaining({ content: 'I am doing well, thank you for asking!' })
          ])
        })
      })

      it('should return null for non-existent conversation', async () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: {},
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 0 }
        }))

        const loaded = await conversationStorage.load('non-existent-id')
        expect(loaded).toBeNull()
      })
    })

    describe('list', () => {
      const mockConversations: Record<string, Conversation> = {
        '1': {
          id: '1',
          title: 'First Conversation',
          messages: mockMessages,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
          metadata: {
            messageCount: 2,
            lastActivity: new Date('2024-01-01T10:00:00Z'),
            starred: true
          }
        },
        '2': {
          id: '2',
          title: 'Second Conversation',
          messages: [],
          createdAt: new Date('2024-01-02T10:00:00Z'),
          updatedAt: new Date('2024-01-02T10:00:00Z'),
          metadata: {
            messageCount: 0,
            lastActivity: new Date('2024-01-02T10:00:00Z'),
            archived: true
          }
        }
      }

      beforeEach(() => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: mockConversations,
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 2 }
        }))
      })

      it('should list all conversations', async () => {
        const list = await conversationStorage.list()
        expect(list).toHaveLength(2)
        expect(list[0].title).toBe('Second Conversation') // More recent first
        expect(list[1].title).toBe('First Conversation')
      })

      it('should filter by starred', async () => {
        const list = await conversationStorage.list({ starred: true })
        expect(list).toHaveLength(1)
        expect(list[0].title).toBe('First Conversation')
      })

      it('should filter by archived', async () => {
        const list = await conversationStorage.list({ archived: true })
        expect(list).toHaveLength(1)
        expect(list[0].title).toBe('Second Conversation')
      })

      it('should filter by query', async () => {
        const list = await conversationStorage.list({ query: 'First' })
        expect(list).toHaveLength(1)
        expect(list[0].title).toBe('First Conversation')
      })
    })

    describe('delete', () => {
      it('should delete conversation', async () => {
        const conversation = createConversation(mockMessages)
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: { [conversation.id]: conversation },
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 1 }
        }))

        await conversationStorage.delete(conversation.id)
        
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'chat-conversations',
          expect.stringContaining('"conversations":{}')
        )
      })
    })

    describe('export', () => {
      it('should export as JSON', async () => {
        const conversation = createConversation(mockMessages)
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: { [conversation.id]: conversation },
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 1 }
        }))

        const exported = await conversationStorage.export(conversation.id, {
          format: 'json',
          includeMetadata: true
        })

        const parsed = JSON.parse(exported)
        expect(parsed.title).toBe(conversation.title)
        expect(parsed.messages).toHaveLength(2)
        expect(parsed.exportedAt).toBeDefined()
      })

      it('should export as markdown', async () => {
        const conversation = createConversation(mockMessages)
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: { [conversation.id]: conversation },
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 1 }
        }))

        const exported = await conversationStorage.export(conversation.id, {
          format: 'markdown',
          includeTimestamps: true
        })

        expect(exported).toContain('# Hello, how are you?')
        expect(exported).toContain('**You**')
        expect(exported).toContain('**Assistant**')
        expect(exported).toContain('Hello, how are you?')
        expect(exported).toContain('I am doing well, thank you for asking!')
      })

      it('should export as text', async () => {
        const conversation = createConversation(mockMessages)
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: { [conversation.id]: conversation },
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 1 }
        }))

        const exported = await conversationStorage.export(conversation.id, {
          format: 'txt'
        })

        expect(exported).toContain('Hello, how are you?')
        expect(exported).toContain('You:')
        expect(exported).toContain('Assistant:')
      })
    })

    describe('import', () => {
      it('should import from JSON', async () => {
        const conversation = createConversation(mockMessages)
        const jsonData = JSON.stringify(conversation)

        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: {},
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 0 }
        }))

        const imported = await conversationStorage.import(jsonData, 'json')
        
        expect(imported.title).toBe(conversation.title)
        expect(imported.messages).toHaveLength(2)
      })

      it('should import from markdown', async () => {
        const markdown = `# Test Conversation

**You**:

Hello, how are you?

**Assistant**:

I am doing well, thank you!`

        localStorageMock.getItem.mockReturnValue(JSON.stringify({
          version: '1.0',
          conversations: {},
          metadata: { lastUpdated: new Date().toISOString(), totalConversations: 0 }
        }))

        const imported = await conversationStorage.import(markdown, 'markdown')
        
        expect(imported.title).toBe('Test Conversation')
        expect(imported.messages).toHaveLength(2)
        expect(imported.messages[0].role).toBe('user')
        expect(imported.messages[0].content).toContain('Hello, how are you?')
        expect(imported.messages[1].role).toBe('assistant')
        expect(imported.messages[1].content).toContain('I am doing well, thank you!')
      })
    })
  })
})