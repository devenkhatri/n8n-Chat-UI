import { 
  Conversation, 
  ConversationSummary, 
  ConversationFilter, 
  ConversationExportOptions,
  ConversationStorage 
} from '../types/conversation'
import { ChatMessage } from '../types/ui'

const STORAGE_KEY = 'chat-conversations'
const STORAGE_VERSION = '1.0'

interface StorageData {
  version: string
  conversations: Record<string, Conversation>
  metadata: {
    lastUpdated: string
    totalConversations: number
  }
}

class LocalConversationStorage implements ConversationStorage {
  private async getStorageData(): Promise<StorageData> {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        return {
          version: STORAGE_VERSION,
          conversations: {},
          metadata: {
            lastUpdated: new Date().toISOString(),
            totalConversations: 0
          }
        }
      }
      
      const parsed = JSON.parse(data) as StorageData
      
      // Convert date strings back to Date objects
      Object.values(parsed.conversations).forEach(conversation => {
        conversation.createdAt = new Date(conversation.createdAt)
        conversation.updatedAt = new Date(conversation.updatedAt)
        if (conversation.metadata?.lastActivity) {
          conversation.metadata.lastActivity = new Date(conversation.metadata.lastActivity)
        }
        conversation.messages.forEach(message => {
          message.timestamp = new Date(message.timestamp)
        })
      })
      
      return parsed
    } catch (error) {
      console.error('Failed to load conversation storage:', error)
      return {
        version: STORAGE_VERSION,
        conversations: {},
        metadata: {
          lastUpdated: new Date().toISOString(),
          totalConversations: 0
        }
      }
    }
  }

  private async setStorageData(data: StorageData): Promise<void> {
    try {
      data.metadata.lastUpdated = new Date().toISOString()
      data.metadata.totalConversations = Object.keys(data.conversations).length
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save conversation storage:', error)
      throw new Error('Failed to save conversation data')
    }
  }

  async save(conversation: Conversation): Promise<void> {
    const data = await this.getStorageData()
    
    // Update conversation metadata
    conversation.updatedAt = new Date()
    if (conversation.metadata) {
      conversation.metadata.messageCount = conversation.messages.length
      conversation.metadata.lastActivity = new Date()
    }
    
    data.conversations[conversation.id] = conversation
    await this.setStorageData(data)
  }

  async load(id: string): Promise<Conversation | null> {
    const data = await this.getStorageData()
    return data.conversations[id] || null
  }

  async list(filter?: ConversationFilter): Promise<ConversationSummary[]> {
    const data = await this.getStorageData()
    let conversations = Object.values(data.conversations)

    // Apply filters
    if (filter) {
      if (filter.starred !== undefined) {
        conversations = conversations.filter(c => c.metadata?.starred === filter.starred)
      }
      
      if (filter.archived !== undefined) {
        conversations = conversations.filter(c => c.metadata?.archived === filter.archived)
      }
      
      if (filter.dateRange) {
        conversations = conversations.filter(c => 
          c.createdAt >= filter.dateRange!.start && 
          c.createdAt <= filter.dateRange!.end
        )
      }
      
      if (filter.tags && filter.tags.length > 0) {
        conversations = conversations.filter(c => 
          c.metadata?.tags?.some(tag => filter.tags!.includes(tag))
        )
      }
      
      if (filter.query) {
        const query = filter.query.toLowerCase()
        conversations = conversations.filter(c => 
          c.title.toLowerCase().includes(query) ||
          c.messages.some(m => m.content.toLowerCase().includes(query))
        )
      }
    }

    // Convert to summaries and sort by last activity
    return conversations
      .map(c => ({
        id: c.id,
        title: c.title,
        messageCount: c.messages.length,
        lastActivity: c.metadata?.lastActivity || c.updatedAt,
        preview: this.generatePreview(c),
        starred: c.metadata?.starred,
        archived: c.metadata?.archived
      }))
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  }

  async delete(id: string): Promise<void> {
    const data = await this.getStorageData()
    delete data.conversations[id]
    await this.setStorageData(data)
  }

  async search(query: string): Promise<ConversationSummary[]> {
    return this.list({ query })
  }

  async export(id: string, options: ConversationExportOptions): Promise<string> {
    const conversation = await this.load(id)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    switch (options.format) {
      case 'json':
        return this.exportAsJson(conversation, options)
      case 'markdown':
        return this.exportAsMarkdown(conversation, options)
      case 'txt':
        return this.exportAsText(conversation, options)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  async import(data: string, format: 'json' | 'markdown'): Promise<Conversation> {
    switch (format) {
      case 'json':
        return this.importFromJson(data)
      case 'markdown':
        return this.importFromMarkdown(data)
      default:
        throw new Error(`Unsupported import format: ${format}`)
    }
  }

  private generatePreview(conversation: Conversation): string {
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    if (!lastMessage) return 'No messages'
    
    const preview = lastMessage.content.substring(0, 100)
    return preview.length < lastMessage.content.length ? `${preview}...` : preview
  }

  private exportAsJson(conversation: Conversation, options: ConversationExportOptions): string {
    const exportData = {
      ...conversation,
      exportedAt: new Date().toISOString(),
      exportOptions: options
    }
    
    if (!options.includeMetadata) {
      delete exportData.metadata
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  private exportAsMarkdown(conversation: Conversation, options: ConversationExportOptions): string {
    let markdown = `# ${conversation.title}\n\n`
    
    if (options.includeMetadata && conversation.metadata) {
      markdown += `**Created:** ${conversation.createdAt.toLocaleDateString()}\n`
      markdown += `**Messages:** ${conversation.metadata.messageCount}\n`
      if (conversation.metadata.tags?.length) {
        markdown += `**Tags:** ${conversation.metadata.tags.join(', ')}\n`
      }
      markdown += '\n---\n\n'
    }
    
    conversation.messages.forEach(message => {
      const role = message.role === 'user' ? '**You**' : '**Assistant**'
      markdown += `${role}${options.includeTimestamps ? ` (${message.timestamp.toLocaleString()})` : ''}:\n\n`
      markdown += `${message.content}\n\n`
    })
    
    return markdown
  }

  private exportAsText(conversation: Conversation, options: ConversationExportOptions): string {
    let text = `${conversation.title}\n${'='.repeat(conversation.title.length)}\n\n`
    
    if (options.includeMetadata && conversation.metadata) {
      text += `Created: ${conversation.createdAt.toLocaleDateString()}\n`
      text += `Messages: ${conversation.metadata.messageCount}\n`
      if (conversation.metadata.tags?.length) {
        text += `Tags: ${conversation.metadata.tags.join(', ')}\n`
      }
      text += '\n' + '-'.repeat(50) + '\n\n'
    }
    
    conversation.messages.forEach(message => {
      const role = message.role === 'user' ? 'You' : 'Assistant'
      text += `${role}${options.includeTimestamps ? ` (${message.timestamp.toLocaleString()})` : ''}:\n`
      text += `${message.content}\n\n`
    })
    
    return text
  }

  private importFromJson(data: string): Conversation {
    try {
      const parsed = JSON.parse(data)
      
      // Validate required fields
      if (!parsed.id || !parsed.title || !Array.isArray(parsed.messages)) {
        throw new Error('Invalid conversation format')
      }
      
      // Convert date strings back to Date objects
      const conversation: Conversation = {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        messages: parsed.messages.map((msg: { id: string; role: string; content: string; timestamp: string }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }
      
      if (conversation.metadata?.lastActivity) {
        conversation.metadata.lastActivity = new Date(conversation.metadata.lastActivity)
      }
      
      return conversation
    } catch {
      throw new Error('Failed to parse JSON conversation data')
    }
  }

  private importFromMarkdown(data: string): Conversation {
    // Basic markdown parsing - this is a simplified implementation
    const lines = data.split('\n')
    const title = lines[0]?.replace(/^#\s*/, '') || 'Imported Conversation'
    
    const messages: ChatMessage[] = []
    let currentMessage: Partial<ChatMessage> | null = null
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      
      // Check for message headers
      const userMatch = line.match(/^\*\*You\*\*/)
      const assistantMatch = line.match(/^\*\*Assistant\*\*/)
      
      if (userMatch || assistantMatch) {
        // Save previous message if exists
        if (currentMessage && currentMessage.content) {
          messages.push({
            id: crypto.randomUUID(),
            role: currentMessage.role!,
            content: currentMessage.content.trim(),
            timestamp: new Date()
          })
        }
        
        // Start new message
        currentMessage = {
          role: userMatch ? 'user' : 'assistant',
          content: ''
        }
      } else if (currentMessage && line.trim()) {
        // Add content to current message
        currentMessage.content = (currentMessage.content || '') + line + '\n'
      }
    }
    
    // Save last message
    if (currentMessage && currentMessage.content) {
      messages.push({
        id: crypto.randomUUID(),
        role: currentMessage.role!,
        content: currentMessage.content.trim(),
        timestamp: new Date()
      })
    }
    
    return {
      id: crypto.randomUUID(),
      title,
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        messageCount: messages.length,
        lastActivity: new Date()
      }
    }
  }
}

// Export singleton instance
export const conversationStorage = new LocalConversationStorage()

// Utility functions
export function generateConversationTitle(messages: ChatMessage[]): string {
  if (messages.length === 0) return 'New Conversation'
  
  const firstUserMessage = messages.find(m => m.role === 'user')
  if (!firstUserMessage) return 'New Conversation'
  
  // Extract first few words or sentence
  const content = firstUserMessage.content.trim()
  const words = content.split(' ').slice(0, 6).join(' ')
  return words.length < content.length ? `${words}...` : words
}

export function createConversation(messages: ChatMessage[], title?: string): Conversation {
  const id = crypto.randomUUID()
  const now = new Date()
  
  return {
    id,
    title: title || generateConversationTitle(messages),
    messages,
    createdAt: now,
    updatedAt: now,
    metadata: {
      messageCount: messages.length,
      lastActivity: now
    }
  }
}