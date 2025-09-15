import { ChatMessage } from './ui'

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  metadata?: {
    messageCount: number
    lastActivity: Date
    tags?: string[]
    starred?: boolean
    archived?: boolean
  }
}

export interface ConversationSummary {
  id: string
  title: string
  messageCount: number
  lastActivity: Date
  preview: string
  starred?: boolean
  archived?: boolean
}

export interface ConversationFilter {
  query?: string
  starred?: boolean
  archived?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
}

export interface ConversationExportOptions {
  format: 'json' | 'markdown' | 'txt'
  includeMetadata?: boolean
  includeTimestamps?: boolean
}

export interface ConversationStorage {
  save: (conversation: Conversation) => Promise<void>
  load: (id: string) => Promise<Conversation | null>
  list: (filter?: ConversationFilter) => Promise<ConversationSummary[]>
  delete: (id: string) => Promise<void>
  search: (query: string) => Promise<ConversationSummary[]>
  export: (id: string, options: ConversationExportOptions) => Promise<string>
  import: (data: string, format: 'json' | 'markdown') => Promise<Conversation>
}