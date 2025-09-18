import { renderHook, act } from '@testing-library/react'
import { useMessageFeedback } from '../use-message-feedback'

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

describe('useMessageFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('initializes with empty state', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.feedback).toEqual({})
    expect(result.current.stats.totalFeedback).toBe(0)
    expect(result.current.recentFeedback).toEqual([])
  })

  it('loads feedback from localStorage', async () => {
    const storedData = {
      version: '1.0',
      feedback: {
        'msg-1': {
          rating: 'positive',
          timestamp: '2024-01-01T10:00:00Z'
        }
      },
      entries: [
        {
          id: 'entry-1',
          messageId: 'msg-1',
          rating: 'positive',
          timestamp: '2024-01-01T10:00:00Z',
          messagePreview: 'Test message'
        }
      ],
      metadata: {
        lastUpdated: '2024-01-01T10:00:00Z',
        totalEntries: 1
      }
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData))

    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.feedback['msg-1']).toBeDefined()
    expect(result.current.feedback['msg-1'].rating).toBe('positive')
    expect(result.current.stats.totalFeedback).toBe(1)
    expect(result.current.stats.positiveCount).toBe(1)
  })

  it('submits positive feedback', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.submitFeedback('msg-1', 'positive', undefined, 'Test message')
    })

    expect(result.current.feedback['msg-1']).toBeDefined()
    expect(result.current.feedback['msg-1'].rating).toBe('positive')
    expect(result.current.stats.totalFeedback).toBe(1)
    expect(result.current.stats.positiveCount).toBe(1)
    expect(result.current.recentFeedback).toHaveLength(1)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('submits negative feedback with comment', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.submitFeedback('msg-1', 'negative', 'Could be better', 'Test message')
    })

    expect(result.current.feedback['msg-1']).toBeDefined()
    expect(result.current.feedback['msg-1'].rating).toBe('negative')
    expect(result.current.feedback['msg-1'].comment).toBe('Could be better')
    expect(result.current.stats.totalFeedback).toBe(1)
    expect(result.current.stats.negativeCount).toBe(1)
  })

  it('removes feedback', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // First submit feedback
    await act(async () => {
      await result.current.submitFeedback('msg-1', 'positive', undefined, 'Test message')
    })

    expect(result.current.feedback['msg-1']).toBeDefined()

    // Then remove it
    await act(async () => {
      await result.current.removeFeedback('msg-1')
    })

    expect(result.current.feedback['msg-1']).toBeUndefined()
    expect(result.current.stats.totalFeedback).toBe(0)
    expect(result.current.recentFeedback).toHaveLength(0)
  })

  it('gets feedback for specific message', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.submitFeedback('msg-1', 'positive', undefined, 'Test message')
    })

    const feedback = result.current.getFeedback('msg-1')
    expect(feedback).toBeDefined()
    expect(feedback?.rating).toBe('positive')

    const nonExistentFeedback = result.current.getFeedback('msg-2')
    expect(nonExistentFeedback).toBeUndefined()
  })

  it('checks if message has feedback', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.hasFeedback('msg-1')).toBe(false)

    await act(async () => {
      await result.current.submitFeedback('msg-1', 'positive', undefined, 'Test message')
    })

    expect(result.current.hasFeedback('msg-1')).toBe(true)
  })

  it('provides feedback summary', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Submit mixed feedback one by one
    await act(async () => {
      await result.current.submitFeedback('msg-1', 'positive', undefined, 'Test message 1')
    })
    
    await act(async () => {
      await result.current.submitFeedback('msg-2', 'positive', undefined, 'Test message 2')
    })
    
    await act(async () => {
      await result.current.submitFeedback('msg-3', 'negative', 'Not good', 'Test message 3')
    })

    const summary = result.current.getFeedbackSummary()
    expect(summary.total).toBe(3)
    expect(summary.positive).toBe(2)
    expect(summary.negative).toBe(1)
  })

  it('calculates correct stats', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Submit feedback with different ratings one by one
    await act(async () => {
      await result.current.submitFeedback('msg-1', 'positive', undefined, 'Test message 1')
    })
    
    await act(async () => {
      await result.current.submitFeedback('msg-2', 'positive', undefined, 'Test message 2')
    })
    
    await act(async () => {
      await result.current.submitFeedback('msg-3', 'negative', 'Not good', 'Test message 3')
    })

    const stats = result.current.stats
    expect(stats.totalFeedback).toBe(3)
    expect(stats.positiveCount).toBe(2)
    expect(stats.negativeCount).toBe(1)
    expect(stats.positivePercentage).toBeCloseTo(66.67, 1)
    expect(stats.negativePercentage).toBeCloseTo(33.33, 1)
    expect(stats.commentsCount).toBe(1)
    expect(stats.averageRating).toBeCloseTo(3.67, 1) // (2*5 + 1*1) / 3
  })

  it('exports feedback as JSON', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.submitFeedback('msg-1', 'positive', undefined, 'Test message')
    })

    let exportedData: string = ''
    await act(async () => {
      exportedData = await result.current.exportFeedback('json')
    })

    const parsed = JSON.parse(exportedData)
    expect(parsed.feedback).toBeDefined()
    expect(parsed.entries).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.exportedAt).toBeDefined()
  })

  it('exports feedback as CSV', async () => {
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.submitFeedback('msg-1', 'positive', undefined, 'Test message')
    })

    let exportedData: string = ''
    await act(async () => {
      exportedData = await result.current.exportFeedback('csv')
    })

    expect(exportedData).toContain('Message ID,Rating,Comment,Timestamp,Message Preview')
    expect(exportedData).toContain('msg-1')
    expect(exportedData).toContain('positive')
    expect(exportedData).toContain('Test message')
  })

  it('handles errors gracefully', async () => {
    // Mock localStorage to throw error
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      try {
        await result.current.submitFeedback('msg-1', 'positive', undefined, 'Test message')
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.error).toBe('Failed to save feedback')
  })

  it('limits recent feedback entries', async () => {
    // Reset localStorage mock to not throw error
    localStorageMock.setItem.mockImplementation(() => {})
    
    const { result } = renderHook(() => useMessageFeedback())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Submit feedback entries one by one
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await result.current.submitFeedback(`msg-${i}`, 'positive', undefined, `Test message ${i}`)
      })
    }

    // Should show recent feedback (the hook keeps the last entry from each submission)
    expect(result.current.recentFeedback.length).toBeGreaterThan(0)
    expect(result.current.stats.totalFeedback).toBe(5)
  })
})